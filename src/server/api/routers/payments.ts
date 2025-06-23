import {
  EFinanceEntryStatus,
  EFinanceEntryType,
  EPaymentMethod,
  PaymentStatus,
} from '@prisma/client';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { capitalize } from 'lodash';

export const paymentsRouter = createTRPCRouter({
  getPaymentsByStudent: protectedProcedure
    .input(z.object({ studentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (!userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const entries = await ctx.prisma.payment.findMany({
        where: {
          studentId: input.studentId,
        },
      });

      const paid = entries.filter((e) => e.status === PaymentStatus.PAID);
      const pending = entries.filter((e) => e.status === PaymentStatus.PENDING);

      return {
        entries,
        paid,
        pending,
      };
    }),

  updatePayment: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
        dueDate: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (!userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      try {
        const student = await ctx.prisma.student.findUnique({
          where: { id: input.studentId },
          include: {
            enrollments: {
              where: { isActive: true },
              include: { plan: true },
            },
          },
        });

        if (!student || !student.enrollments[0]?.plan) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Plano do aluno não encontrado',
          });
        }

        const plan = student.enrollments[0].plan;
        const amount = plan.price * 100;

        const category = await ctx.prisma.category.findFirst({
          where: {
            userId,
            isFixed: true,
            name: { equals: 'Alunos', mode: 'insensitive' },
          },
        });

        if (!category?.id) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Categoria "Alunos" não encontrada',
          });
        }

        const dueDate = new Date(input.dueDate);

        const payment = await ctx.prisma.payment.findFirst({
          where: {
            studentId: input.studentId,
            dueDate,
            status: PaymentStatus.PENDING,
          },
        });

        if (!payment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Nenhuma parcela pendente encontrada para essa data.',
          });
        }

        // Buscar todas as parcelas do aluno e identificar o número da atual
        const allPayments = await ctx.prisma.payment.findMany({
          where: { studentId: input.studentId },
          orderBy: { dueDate: 'asc' },
        });

        const parcelNumber =
          allPayments.findIndex((p) => p.id === payment.id) + 1;
        const monthYear = format(payment.dueDate, 'MMMM/yyyy', {
          locale: ptBR,
        });

        await ctx.prisma.$transaction([
          ctx.prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.PAID,
              paymentDate: new Date(),
            },
          }),
          ctx.prisma.financeEntry.create({
            data: {
              date: new Date(),
              amount,
              paymentMethod: EPaymentMethod.CREDIT_CARD,
              description: `Parcela ${parcelNumber} de ${student.name} com vencimento em ${capitalize(monthYear)}.`,
              type: EFinanceEntryType.STUDENTS,
              status: EFinanceEntryStatus.PAID,
              currency: 'BRL',
              userId,
              categoryId: category.id,
              studentId: student.id,
            },
          }),
        ]);

        return { ok: true };
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erro ao atualizar pagamento.',
        });
      }
    }),
});
