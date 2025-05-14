// server/api/routers/plan.ts
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { paginationSchema } from '@/server/validations/pagination';
import { createPlanSchema, updatePlanSchema } from '@/server/validations/plans';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export const planRouter = createTRPCRouter({
  // --- CREATE ---
  create: protectedProcedure
    .input(createPlanSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Não autorizado',
        });
      }

      // 1) Verifica duplicata para este usuário
      const exists = await ctx.prisma.plan.findFirst({
        where: {
          userId: userId.toString(),
          name: input.name,
        },
      });
      if (exists) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Você já tem um plano com esse nome',
        });
      }

      // 2) Cria plano vinculando ao usuário
      const plan = await ctx.prisma.plan.create({
        data: {
          name: input.name,
          description: input.description,
          price: new Prisma.Decimal(input.price),
          duration: input.duration,
          user: {
            connect: { id: userId.toString() },
          },
        },
      });

      return { ok: true, data: plan };
    }),

  // --- UPDATE ---
  update: protectedProcedure
    .input(updatePlanSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Não autorizado',
        });
      }

      // 1) Checa se o plano existe e pertence ao usuário
      const current = await ctx.prisma.plan.findFirst({
        where: { id: input.id, userId: userId.toString() },
      });
      if (!current) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plano não encontrado',
        });
      }

      // 2) Evita conflito de nome com outro plano do mesmo usuário
      const conflict = await ctx.prisma.plan.findFirst({
        where: {
          userId,
          name: input.name,
          NOT: { id: input.id },
        },
      });
      if (conflict) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Outro plano com esse nome já existe',
        });
      }

      // 3) Atualiza
      const updated = await ctx.prisma.plan.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          price: new Prisma.Decimal(input.price),
          duration: input.duration,
        },
      });

      return { ok: true, data: updated };
    }),

  // --- LIST + PAGINAÇÃO ---
  getAll: protectedProcedure
    .input(
      paginationSchema.extend({
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Não autorizado',
        });
      }

      const { page, limit, search } = input;
      const skip = (page - 1) * limit;
      const where: Prisma.PlanWhereInput = {
        userId,
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      };

      const [data, total] = await Promise.all([
        ctx.prisma.plan.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.prisma.plan.count({ where }),
      ]);

      return {
        ok: true,
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // --- GET BY ID ---
  getByID: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Não autorizado',
        });
      }

      const plan = await ctx.prisma.plan.findFirst({
        where: { id: input.id, userId },
      });
      if (!plan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plano não encontrado',
        });
      }

      return { ok: true, data: plan };
    }),

  // --- DELETE ---
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Não autorizado',
        });
      }

      // Verifica se pertence ao usuário
      const toDelete = await ctx.prisma.plan.findFirst({
        where: { id: input.id, userId },
      });
      if (!toDelete) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plano não encontrado',
        });
      }

      await ctx.prisma.plan.delete({ where: { id: input.id } });
      return { ok: true, message: 'Plano excluído com sucesso' };
    }),
});
