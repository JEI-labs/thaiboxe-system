import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { paginationSchema } from '@/server/validations/pagination';
import { createStudentSchema } from '@/server/validations/users';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

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

      try {
        const emailExists = await ctx.prisma.student.findFirst({
          where: { email: input.email },
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
            birthDate: input.birthDate,
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
            skip,
            take: limit,
            orderBy: {
              createdAt: 'desc',
            },
          }),
          ctx.prisma.student.count(),
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
          where: { id: input.id },
        });

        if (!student) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Aluno nao encontrado',
          });
        }

        await ctx.prisma.student.delete({
          where: { id: input.id },
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
