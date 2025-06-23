import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

import {
  createStudentSchema,
  updateAvatarSchema,
  updateStudentSchema,
} from '@/server/validations/students';
import { convertToDate } from '@/utils/converterUtils';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { del } from '@vercel/blob';
import {
  EFinanceEntryType,
  EPaymentMethod,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { getAllStudentInputSchema } from '@/server/validations/pagination';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const studentRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createStudentSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Não autorizado',
        });
      }

      // Formata datas e define início
      const birthDateFormatted = convertToDate(input.birthDate);
      const startDate = new Date();

      // 1) Verifica e-mail duplicado
      const emailExists = await ctx.prisma.student.findFirst({
        where: { email: input.email, userId },
      });

      if (emailExists) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Email já cadastrado',
        });
      }

      // 2) Carrega o plano
      const plan = await ctx.prisma.plan.findUnique({
        where: { id: input.planId },
      });
      if (!plan) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Plano não encontrado',
        });
      }

      try {
        const createdStudent = await ctx.prisma.$transaction(async (tx) => {
          // 3. Criação do aluno
          const student = await tx.student.create({
            data: {
              email: input.email,
              name: input.name,
              phone: input.phone,
              birthDate: birthDateFormatted,
              avatar: input.avatarUrl,
              userId,
            },
          });

          // 4. Criação da matrícula
          await tx.enrollment.create({
            data: {
              studentId: student.id,
              planId: plan.id,
              startDate,
              endDate: new Date(
                new Date(startDate).setMonth(
                  startDate.getMonth() + plan.duration,
                ),
              ),
            },
          });

          // 5. Geração dos pagamentos
          const payments = Array.from({ length: plan.duration }).map((_, i) => {
            const dueDate = new Date(startDate);
            dueDate.setMonth(dueDate.getMonth() + i);
            return {
              studentId: student.id,
              amount: plan.price,
              dueDate,
              status: i === 0 ? PaymentStatus.PAID : PaymentStatus.PENDING,
            };
          });
          await tx.payment.createMany({ data: payments });

          // 6. Busca da categoria fixa do usuário
          const category = await tx.category.findFirst({
            where: {
              userId,
              isFixed: true,
              name: { equals: 'Alunos', mode: 'insensitive' },
            },
          });
          if (!category?.id) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Categoria fixa não encontrada para criação do aluno',
            });
          }

          const firstDueDate = format(startDate, 'MMMM/yyyy', { locale: ptBR });

          // 7. Criação da entrada financeira
          await tx.financeEntry.create({
            data: {
              amount: plan.price * 100,
              date: startDate,
              type: EFinanceEntryType.STUDENTS,
              description: `Parcela 1 de ${student.name} com vencimento em ${firstDueDate}.`,
              status: PaymentStatus.PAID,
              currency: 'BRL',
              paymentMethod: EPaymentMethod.CREDIT_CARD,
              userId,
              categoryId: category.id,
              studentId: student.id,
            },
          });

          return student;
        });

        return { ok: true, data: createdStudent };
      } catch (error) {
        console.error(error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Não foi possível cadastrar aluno',
        });
      }
    }),

  updateAvatar: protectedProcedure
    .input(updateAvatarSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Não autorizado',
        });
      }

      const studentExists = await ctx.prisma.student.findFirst({
        where: {
          id: input.studentId,
          userId,
        },
      });

      if (!studentExists) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Aluno não existe',
        });
      }

      await ctx.prisma.student.update({
        where: {
          id: input.studentId,
          userId,
        },
        data: {
          avatar: input.avatarUrl,
        },
      });

      return {
        ok: true,
        message: 'Avatar atualizado com sucesso!',
      };
    }),

  updateByID: protectedProcedure
    .input(updateStudentSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Não autorizado',
        });
      }

      const birthDateFormatted = convertToDate(input.birthDate);

      // 1) Procura por ALGUÉM que não seja o próprio ID mas já tenha este e-mail
      const conflict = await ctx.prisma.student.findFirst({
        where: {
          userId,
          email: input.email,
          NOT: { id: input.id },
        },
      });
      if (conflict) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Já existe um aluno com esse email',
        });
      }

      const updated = await ctx.prisma.student.update({
        where: { id: input.id },
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone,
          birthDate: birthDateFormatted,
        },
      });

      return {
        message: 'Aluno atualizado com sucesso',
        data: updated,
      };
    }),

  getAll: protectedProcedure
    .input(getAllStudentInputSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Não autorizado',
        });
      }

      const { page, limit, search, status, from, to } = input;
      const skip = (page - 1) * limit;

      try {
        // Construir filtro dinâmico
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const whereConditions: Prisma.StudentWhereInput = {
          userId,
        };

        if (search && search.trim() !== '') {
          whereConditions.name = {
            contains: search.trim(),
            mode: 'insensitive',
          };
        }

        // Filtros de data (data de criação do aluno)
        if (from || to) {
          whereConditions.createdAt = {};
          if (from) whereConditions.createdAt.gte = new Date(from);
          if (to) whereConditions.createdAt.lte = new Date(to);
        }

        const [students, total] = await Promise.all([
          ctx.prisma.student.findMany({
            where: whereConditions,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
              payments: true,
              enrollments: {
                where: { isActive: true },
                include: { plan: true },
              },
            },
          }),
          ctx.prisma.student.count({
            where: { userId },
          }),
        ]);

        // Montar status calculado para cada aluno
        const now = new Date();
        const result = students.map((student) => {
          const activeEnrollment = student.enrollments.find((e) => e.isActive);
          const enrollmentStart = activeEnrollment?.startDate ?? null;
          const enrollmentEnd = activeEnrollment?.endDate ?? null;

          const paymentsWithinEnrollment = student.payments.filter((p) => {
            return (
              (!enrollmentStart || p.dueDate >= enrollmentStart) &&
              (!enrollmentEnd || p.dueDate <= enrollmentEnd)
            );
          });

          const hasOverduePayment = paymentsWithinEnrollment.some(
            (p) => p.status === 'PENDING' && p.dueDate < now,
          );

          const hasUpcomingPayment = paymentsWithinEnrollment.some((p) => {
            const diffMs = p.dueDate.getTime() - now.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            return p.status === 'PENDING' && diffDays <= 3 && diffDays >= 0;
          });

          let enrollmentStatus: 'EM DIA' | 'PENDENTE' | 'ATRASADO' = 'EM DIA';

          if (!hasOverduePayment && !hasUpcomingPayment && enrollmentEnd) {
            const diffMs = enrollmentEnd.getTime() - now.getTime();
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

            if (diffDays < 0) enrollmentStatus = 'ATRASADO';
            else if (diffDays <= 3) enrollmentStatus = 'PENDENTE';
          }

          const status: 'EM DIA' | 'PENDENTE' | 'ATRASADO' = hasOverduePayment
            ? 'ATRASADO'
            : hasUpcomingPayment
              ? 'PENDENTE'
              : enrollmentStatus;

          return {
            ...student,
            status,
            planName: activeEnrollment?.plan?.name ?? 'Sem plano',
          };
        });

        // Se filtro por status foi passado, filtra após o map
        const filteredResult =
          status && status.length > 0
            ? result.filter((student) => status.includes(student.status))
            : result;

        const filteredTotal =
          status && status.length > 0 ? filteredResult.length : total;
        const paginatedResult = filteredResult.slice(0, limit);

        return {
          ok: true,
          data: paginatedResult,
          pagination: {
            page,
            limit,
            total: filteredTotal,
            totalPages: Math.ceil(filteredTotal / limit),
          },
        };
      } catch (error) {
        console.log(error);
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Não foi possível carregar alunos',
        });
      }
    }),

  getByID: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Não autorizado',
        });
      }

      const studentData = await ctx.prisma.student.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!studentData) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Categoria não encontrada.',
          cause: { id: input.id, userId: ctx.session.user.id },
        });
      }

      return {
        message: 'Aluno encontrado',
        data: studentData,
      };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Não autorizado',
        });
      }

      try {
        const student = await ctx.prisma.student.findUnique({
          where: { id: input.id, userId },
        });

        if (!student) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Aluno nao encontrado',
          });
        }

        if (student.avatar) {
          try {
            await del(student.avatar);
          } catch (err) {
            console.error('Erro ao deletar avatar do Vercel Blob:', err);
          }
        }
        await ctx.prisma.financeEntry.deleteMany({
          where: {
            userId,
            studentId: student.id,
          },
        });

        await ctx.prisma.student.delete({
          where: { id: input.id, userId },
        });

        return {
          ok: true,
          message: 'Aluno deletado com sucesso',
        };
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Não foi possível deletar aluno',
        });
      }
    }),
});
