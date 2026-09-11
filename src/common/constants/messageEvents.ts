import { EMessageEvent } from '@prisma/client';

export interface MessageEventInfo {
  label: string;
  description: string;
  /** Enviado por rotina agendada, não pelo admin. */
  automatic: boolean;
}

export const MESSAGE_EVENTS: Record<EMessageEvent, MessageEventInfo> = {
  PAYMENT_OVERDUE: {
    label: 'Pagamento atrasado',
    description: 'Aluno com parcela vencida e ainda não paga.',
    automatic: true,
  },
  ONE_MONTH_UNPAID: {
    label: 'Um mês sem pagar',
    description: 'Aluno sem nenhum pagamento registrado há 30 dias ou mais.',
    automatic: true,
  },
  BIRTHDAY: {
    label: 'Aniversário',
    description: 'Enviado no dia do aniversário do aluno.',
    automatic: true,
  },
  EVENT_ANNOUNCEMENT: {
    label: 'Anúncio de evento',
    description: 'Comunicado de evento, graduação ou aula especial.',
    automatic: false,
  },
  PROMOTIONAL: {
    label: 'Promocional',
    description: 'Oferta enviada individualmente pelas ações do aluno.',
    automatic: false,
  },
};

export const MESSAGE_EVENT_LIST = Object.entries(MESSAGE_EVENTS).map(
  ([value, info]) => ({ value: value as EMessageEvent, ...info }),
);

/** Placeholders aceitos no corpo da mensagem. */
export const MESSAGE_PLACEHOLDERS = [
  { token: '{{aluno}}', description: 'Nome completo do aluno' },
  { token: '{{primeiro_nome}}', description: 'Primeiro nome do aluno' },
];
