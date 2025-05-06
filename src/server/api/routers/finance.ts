// server/routers/finance.ts

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { createFinanceEntrySchema } from '@/server/validations/finance';
import { convertToDate } from '@/utils/converterUtils';
import { TRPCError } from '@trpc/server';

export const financeRouter = createTRPCRouter({
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
        where: { userId },
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
            userId,
            date: dateObj,
            amount: input.amount,
            category: input.category,
            description: input.description ?? null,
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
