import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { createStudentSchema } from "@/server/validations/users";
import { TRPCError } from "@trpc/server";

export const usersRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createStudentSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Não autorizado",
        });
      }

      try {
        const emailExists = await ctx.prisma.student.findFirst({
          where: { email: input.email },
        });

        if (emailExists) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email já cadastrado",
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
          code: "INTERNAL_SERVER_ERROR",
          message: "Não foi possível cadastrar aluno",
        });
      }
    }),
});
