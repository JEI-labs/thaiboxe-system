import 'server-only';

import {
  EMessageEvent,
  EMessageStatus,
  PaymentStatus,
  type MessageTemplate,
  type WhatsappConfig,
} from '@prisma/client';

import { prisma } from '@/server/db';
import {
  extractPlaceholders,
  renderTemplate,
  sendWhatsappMessage,
} from '@/server/whatsapp/client';

/**
 * Rotina das mensagens automáticas.
 *
 * Três garantias que sustentam o resto: só dispara com conexão ativa, nunca
 * manda duas vezes a mesma coisa no mesmo dia para o mesmo aluno (o
 * MessageLog é a trava), e há teto por execução — disparo em rajada é o que
 * derruba número no WhatsApp.
 */

/** Teto por execução: o cron roda de novo e o resto sai na próxima. */
const MAX_PER_RUN = 15;

/** Respiro entre um envio e outro, pelo mesmo motivo. */
const DELAY_MS = 500;

export interface AutomationReport {
  sent: number;
  failed: number;
  skipped: Array<string>;
  details: Array<{
    event: EMessageEvent;
    student: string;
    ok: boolean;
    error?: string;
  }>;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Hora corrente no fuso da academia, não no do servidor. */
function hourInSaoPaulo(now: Date): number {
  const value = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: 'numeric',
    hour12: false,
  }).format(now);
  return Number(value);
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

interface Target {
  studentId: string;
  name: string;
  phone: string;
}

/** Quem se encaixa na regra hoje. */
async function findTargets(
  userId: string,
  event: EMessageEvent,
  offsetDays: number,
  now: Date,
): Promise<Array<Target>> {
  const today = startOfDay(now);

  if (event === EMessageEvent.BIRTHDAY) {
    const students = await prisma.student.findMany({
      where: { userId, birthDate: { not: null } },
      select: { id: true, name: true, phone: true, birthDate: true },
    });
    return students
      .filter(
        (student) =>
          student.birthDate &&
          student.birthDate.getMonth() === today.getMonth() &&
          student.birthDate.getDate() === today.getDate(),
      )
      .map((student) => ({
        studentId: student.id,
        name: student.name,
        phone: student.phone,
      }));
  }

  /* Faixa de vencimento por evento. O lembrete olha para a frente, o aviso
     para hoje e a cobrança para trás, limitada pela janela configurada — sem
     ela, o sistema cobraria uma parcela de um ano atrás. */
  const range =
    event === EMessageEvent.PAYMENT_DUE_SOON
      ? { gte: addDays(today, offsetDays), lt: addDays(today, offsetDays + 1) }
      : event === EMessageEvent.PAYMENT_DUE_TODAY
        ? { gte: today, lt: addDays(today, 1) }
        : { gte: addDays(today, -offsetDays), lt: today };

  const payments = await prisma.payment.findMany({
    where: {
      status: PaymentStatus.PENDING,
      dueDate: range,
      student: { userId },
    },
    select: {
      student: { select: { id: true, name: true, phone: true } },
    },
  });

  // um aluno com duas parcelas na faixa recebe uma mensagem, não duas
  const unique = new Map<string, Target>();
  for (const payment of payments) {
    unique.set(payment.student.id, {
      studentId: payment.student.id,
      name: payment.student.name,
      phone: payment.student.phone,
    });
  }
  return Array.from(unique.values());
}

async function alreadySentToday(
  userId: string,
  studentId: string,
  event: EMessageEvent,
  now: Date,
): Promise<boolean> {
  const existing = await prisma.messageLog.findFirst({
    where: {
      userId,
      studentId,
      event,
      status: EMessageStatus.SENT,
      createdAt: { gte: startOfDay(now) },
    },
    select: { id: true },
  });
  return Boolean(existing);
}

async function deliver(
  config: WhatsappConfig,
  template: MessageTemplate,
  target: Target,
  event: EMessageEvent,
  userId: string,
) {
  const values = {
    aluno: target.name,
    primeiro_nome: target.name.split(' ')[0] ?? target.name,
  };

  const body = renderTemplate(template.body, values);
  const parameters = extractPlaceholders(template.body).map(
    (key) => values[key as keyof typeof values] ?? '',
  );

  const result = await sendWhatsappMessage(config, target.phone, body, {
    metaTemplateName: template.providerTemplateName,
    metaLanguage: template.providerLanguage,
    parameters,
  });

  await prisma.messageLog.create({
    data: {
      event,
      body,
      status: result.ok ? EMessageStatus.SENT : EMessageStatus.FAILED,
      error: result.error ?? null,
      toNumber: target.phone,
      studentId: target.studentId,
      templateId: template.id,
      userId,
    },
  });

  return result;
}

export async function runAutomationsForUser(
  userId: string,
  now: Date = new Date(),
): Promise<AutomationReport> {
  const report: AutomationReport = {
    sent: 0,
    failed: 0,
    skipped: [],
    details: [],
  };

  const config = await prisma.whatsappConfig.findFirst({
    where: { userId, isActive: true },
  });
  if (!config) {
    report.skipped.push('nenhuma conexão de WhatsApp ativa');
    return report;
  }

  const automations = await prisma.messageAutomation.findMany({
    where: { userId, isActive: true },
    include: { template: true },
  });
  if (automations.length === 0) {
    report.skipped.push('nenhuma automação ligada');
    return report;
  }

  const hour = hourInSaoPaulo(now);

  for (const automation of automations) {
    if (!automation.template) {
      report.skipped.push(`${automation.event}: sem modelo escolhido`);
      continue;
    }
    if (hour < automation.sendHour) {
      report.skipped.push(
        `${automation.event}: só a partir das ${automation.sendHour}h`,
      );
      continue;
    }

    const targets = await findTargets(
      userId,
      automation.event,
      automation.offsetDays,
      now,
    );

    for (const target of targets) {
      if (report.sent + report.failed >= MAX_PER_RUN) {
        report.skipped.push(
          'teto por execução atingido; o resto sai na próxima',
        );
        return report;
      }

      if (!target.phone) continue;
      if (
        await alreadySentToday(userId, target.studentId, automation.event, now)
      ) {
        continue;
      }

      const result = await deliver(
        config,
        automation.template,
        target,
        automation.event,
        userId,
      );

      if (result.ok) report.sent += 1;
      else report.failed += 1;

      report.details.push({
        event: automation.event,
        student: target.name,
        ok: result.ok,
        error: result.error,
      });

      await sleep(DELAY_MS);
    }
  }

  return report;
}

/** Todas as academias, para a chamada do cron. */
export async function runAutomationsForEveryone(now: Date = new Date()) {
  const users = await prisma.user.findMany({
    where: { whatsappConfigs: { some: { isActive: true } } },
    select: { id: true },
  });

  const reports = await Promise.all(
    users.map(async (user) => ({
      userId: user.id,
      ...(await runAutomationsForUser(user.id, now)),
    })),
  );

  return reports;
}
