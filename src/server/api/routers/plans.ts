import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { createPlanSchema } from '@/server/validations/plans';
import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const plansRouter = createTRPCRouter({
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

      const planExists = await ctx.prisma.plan.findFirst({
        where: { name: input.name },
      });

      if (planExists) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Já existe um plano com este nome',
        });
      }

      const createdPlan = await ctx.prisma.plan.create({
        data: {
          name: input.name,
          description: input.description,
          price: input.price,
          duration: input.duration,
        },
      });

      return {
        ok: true,
        data: createdPlan,
      };
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
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

      const where: Prisma.PlanWhereInput = input.search
        ? {
            name: {
              contains: input.search,
              mode: Prisma.QueryMode.insensitive,
            },
          }
        : {};

      const [data, total] = await Promise.all([
        ctx.prisma.plan.findMany({
          where,
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.prisma.plan.count({ where }),
      ]);

      // 🔁 Converte o price de Decimal para number
      const parsedData = data.map((plan) => ({
        ...plan,
        price: Number(plan.price),
      }));

      return {
        data: parsedData,
        pagination: {
          total,
          page: input.page,
          limit: input.limit,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

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

      await ctx.prisma.plan.delete({
        where: { id: input.id },
      });

      return { ok: true };
    }),

  update: protectedProcedure
    .input(
      createPlanSchema.extend({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Não autorizado',
        });
      }

      const { id, ...data } = input;

      const updatedPlan = await ctx.prisma.plan.update({
        where: { id },
        data,
      });

      return {
        ok: true,
        data: updatedPlan,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Não autorizado',
        });
      }

      const plan = await ctx.prisma.plan.findUnique({
        where: { id: input.id },
      });

      if (!plan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plano não encontrado',
        });
      }

      return { data: plan };
    }),
});
