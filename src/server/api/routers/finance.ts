// server/api/routers/finance.ts
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { createFinanceEntrySchema } from '@/server/validations/finance';
import { paginationSchema } from '@/server/validations/pagination';
import { convertToDate } from '@/utils/converterUtils';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { EFinanceEntryType } from '@prisma/client';

export const financeRouter = createTRPCRouter({
  /**
   * Retorna lançamentos financeiros do usuário autenticado,
   * com paginação, filtro por tipo e busca por texto.
   */
  getAll: protectedProcedure
    .input(
      paginationSchema.extend({
        search: z.string().optional(),
        type: z.nativeEnum(EFinanceEntryType).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Usuário não autenticado',
        });
      }

      const { page, limit, search, type } = input;
      const skip = (page - 1) * limit;

      // monta filtro dinâmico
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = { userId };
      if (type) where.type = type;
      if (search) {
        where.OR = [
          { description: { contains: search, mode: 'insensitive' } },
          { referenceId: { contains: search, mode: 'insensitive' } },
        ];
      }

      try {
        const [entries, total] = await Promise.all([
          ctx.prisma.financeEntry.findMany({
            where,
            orderBy: { date: 'desc' },
            skip,
            take: limit,
          }),
          ctx.prisma.financeEntry.count({ where }),
        ]);

        return {
          ok: true,
          data: entries,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
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
   * Cria um novo lançamento financeiro com todos os campos do schema.
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

      const dateObj = convertToDate(input.date);
      console.log(input.amount);

      try {
        const entry = await ctx.prisma.financeEntry.create({
          data: {
            userId: String(userId),
            date: dateObj,
            amount: Number(input.amount),
            type: input.type,
            status: input.status,
            categoryId: input.category,
            paymentMethod: input.paymentMethod ?? undefined,
            referenceId: input.referenceId ?? undefined,
            description: input.description ?? undefined,
            currency: input.currency,
          },
        });
        return { ok: true, data: entry };
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
