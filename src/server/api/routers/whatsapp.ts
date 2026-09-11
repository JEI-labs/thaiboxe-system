import { EMessageEvent, EWhatsappProvider } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '../trpc';
import {
  extractPlaceholders,
  renderTemplate,
  sendWhatsappMessage,
} from '@/server/whatsapp/client';

const configSchema = z.object({
  provider: z.nativeEnum(EWhatsappProvider),
  baseUrl: z.string().url('Informe a URL da instância'),
  instanceId: z.string().nullable().optional(),
  /** Vazio numa edição significa "manter o token atual". */
  token: z.string().optional(),
  senderNumber: z.string().min(8, 'Informe o número remetente'),
  isActive: z.boolean(),
});

export const whatsappRouter = createTRPCRouter({
  /**
   * Nunca devolve o token: ele viaja para o cliente e ficaria visível no
   * payload da página. Só informa se já existe um salvo.
   */
  getConfig: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

    const config = await ctx.prisma.whatsappConfig.findUnique({
      where: { userId },
      select: {
        id: true,
        provider: true,
        baseUrl: true,
        instanceId: true,
        senderNumber: true,
        isActive: true,
        token: false,
      },
    });

    return config ? { ...config, hasToken: true } : null;
  }),

  saveConfig: protectedProcedure
    .input(configSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const existing = await ctx.prisma.whatsappConfig.findUnique({
        where: { userId },
        select: { token: true },
      });

      const token = input.token?.trim() ? input.token.trim() : existing?.token;
      if (!token) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Informe o token do provedor.',
        });
      }

      const data = {
        provider: input.provider,
        baseUrl: input.baseUrl,
        instanceId: input.instanceId ?? null,
        token,
        senderNumber: input.senderNumber,
        isActive: input.isActive,
      };

      await ctx.prisma.whatsappConfig.upsert({
        where: { userId },
        create: { ...data, userId },
        update: data,
      });

      return { message: 'Configuração salva' };
    }),

  listTemplates: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

    return ctx.prisma.messageTemplate.findMany({
      where: { userId },
      orderBy: [{ event: 'asc' }, { createdAt: 'asc' }],
    });
  }),

  saveTemplate: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(),
        event: z.nativeEnum(EMessageEvent),
        name: z.string().min(1, 'Informe um nome'),
        body: z.string().min(1, 'Escreva a mensagem'),
        providerTemplateName: z.string().nullable().optional(),
        providerLanguage: z.string().nullable().optional(),
        isActive: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

      if (input.id) {
        const result = await ctx.prisma.messageTemplate.updateMany({
          where: { id: input.id, userId },
          data: {
            event: input.event,
            name: input.name,
            body: input.body,
            providerTemplateName: input.providerTemplateName || null,
            providerLanguage: input.providerLanguage || 'pt_BR',
            isActive: input.isActive,
          },
        });
        if (result.count === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Modelo não encontrado.',
          });
        }
        return { message: 'Modelo atualizado' };
      }

      await ctx.prisma.messageTemplate.create({
        data: {
          event: input.event,
          name: input.name,
          body: input.body,
          providerTemplateName: input.providerTemplateName || null,
          providerLanguage: input.providerLanguage || 'pt_BR',
          isActive: input.isActive,
          userId,
        },
      });

      return { message: 'Modelo criado' };
    }),

  deleteTemplate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const result = await ctx.prisma.messageTemplate.deleteMany({
        where: { id: input.id, userId },
      });
      if (result.count === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Modelo não encontrado.',
        });
      }
      return { message: 'Modelo excluído' };
    }),

  /** Envio manual, disparado pelas ações da linha do aluno. */
  sendToStudent: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
        event: z.nativeEnum(EMessageEvent),
        templateId: z.string().optional(),
        /** Texto final já editado na tela; o modelo serve de ponto de partida. */
        body: z.string().min(1, 'Escreva a mensagem'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const [config, student, template] = await Promise.all([
        ctx.prisma.whatsappConfig.findUnique({ where: { userId } }),
        ctx.prisma.student.findFirst({
          where: { id: input.studentId, userId },
          select: { id: true, name: true, phone: true },
        }),
        input.templateId
          ? ctx.prisma.messageTemplate.findFirst({
              where: { id: input.templateId, userId },
            })
          : Promise.resolve(null),
      ]);

      if (!student) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Aluno não encontrado.',
        });
      }
      if (!config) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Configure a integração de WhatsApp em Configurações.',
        });
      }

      const values: Record<string, string> = {
        aluno: student.name,
        primeiro_nome: student.name.split(' ')[0] ?? student.name,
      };

      const body = renderTemplate(input.body, values);

      // a Meta usa parâmetros posicionais no corpo do template, então a
      // ordem enviada tem de ser a ordem em que aparecem no texto
      const parameters = extractPlaceholders(input.body).map(
        (key) => values[key] ?? '',
      );

      const result = await sendWhatsappMessage(config, student.phone, body, {
        metaTemplateName: template?.providerTemplateName,
        metaLanguage: template?.providerLanguage,
        parameters,
      });

      // registra sucesso e falha: o histórico é o que explica um envio que
      // o aluno diz não ter recebido
      await ctx.prisma.messageLog.create({
        data: {
          event: input.event,
          body,
          status: result.ok ? 'SENT' : 'FAILED',
          error: result.error ?? null,
          toNumber: student.phone,
          studentId: student.id,
          templateId: input.templateId ?? null,
          userId,
        },
      });

      if (!result.ok) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: result.error ?? 'Não foi possível enviar a mensagem.',
        });
      }

      return { message: 'Mensagem enviada' };
    }),
});
