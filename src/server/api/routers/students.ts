import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { paginationSchema } from '@/server/validations/pagination';
import {
  createStudentSchema,
  updateAvatarSchema,
  updateStudentSchema,
} from '@/server/validations/students';
import { convertToDate } from '@/utils/converterUtils';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { del } from '@vercel/blob';

export const studentRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createStudentSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const birthDateFormatted = convertToDate(input.birthDate);

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Não autorizado',
        });
      }

      try {
        const emailExists = await ctx.prisma.student.findFirst({
          where: { email: input.email, userId },
        });

        if (emailExists) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Email já cadastrado',
          });
        }

        const createdStudent = await ctx.prisma.student.create({
          data: {
            email: input.email,
            name: input.name,
            phone: input.phone,
            birthDate: birthDateFormatted,
            avatar: input.avatarUrl,
            userId,
          },
        });

        return {
          ok: true,
          data: createdStudent,
        };
      } catch (error) {
        console.log(error);

        if (error instanceof TRPCError) {
          throw error;
        }

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
    .input(paginationSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Não autorizado',
        });
      }

      const { page, limit } = input;
      const skip = (page - 1) * limit;

      try {
        const [students, total] = await Promise.all([
          ctx.prisma.student.findMany({
            where: {
              userId,
            },
            skip,
            take: limit,
            orderBy: {
              createdAt: 'desc',
            },
          }),
          ctx.prisma.student.count({
            where: {
              userId,
            },
          }),
        ]);

        return {
          ok: true,
          data: students,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        console.log(error);

        if (error instanceof TRPCError) {
          throw error;
        }

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
