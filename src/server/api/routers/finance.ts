// server/routers/finance.ts

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { createFinanceEntrySchema } from '@/server/validations/finance';
import { convertToDate } from '@/utils/converterUtils';
import { TRPCError } from '@trpc/server';

export const financeRouter = createTRPCRouter({
  /**
   * Retorna todos os lançamentos financeiros do usuário autenticado,
   * ordenados por data decrescente.
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Usuário não autenticado',
      });
    }

    try {
      const entries = await ctx.prisma.financeEntry.findMany({
        where: { userId: userId.toString() },
        orderBy: { date: 'desc' },
      });
      return {
        ok: true,
        data: entries,
      };
    } catch (error) {
      console.error('Erro ao carregar lançamentos financeiros:', error);
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Não foi possível carregar lançamentos financeiros',
      });
    }
  }),

  /**
   * Cria um novo lançamento financeiro com todos os campos do schema:
   * date, amount, type, status, category, paymentMethod, referenceId, description, currency.
   */
  create: protectedProcedure
    .input(createFinanceEntrySchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Usuário não autenticado',
        });
      }

      // converte "DD/MM/AAAA" em Date
      const dateObj = convertToDate(input.date);

      try {
        const entry = await ctx.prisma.financeEntry.create({
          data: {
            userId: userId.toString(),
            date: dateObj,
            amount: Number(input.amount),
            type: input.type,
            status: input.status,
            category: input.category,
            paymentMethod: input.paymentMethod ?? undefined,
            referenceId: input.referenceId ?? undefined,
            description: input.description ?? undefined,
            currency: input.currency,
          },
        });
        return {
          ok: true,
          data: entry,
        };
      } catch (error) {
        console.error('Erro ao criar lançamento financeiro:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Não foi possível adicionar lançamento financeiro',
        });
      }
    }),
});
