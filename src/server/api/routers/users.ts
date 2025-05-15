import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { updateUserSchema } from '@/server/validations/users';
import { TRPCError } from '@trpc/server';
import { hash } from 'argon2';

export const usersRouter = createTRPCRouter({
  update: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Não autorizado',
        });
      }

      const existingUser = await ctx.prisma.user.findUnique({
        where: { id: userId.toString() },
      });

      if (!existingUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usuário não encontrado',
        });
      }

      const hashedPassword = await hash(input.password);

      const updatedUser = await ctx.prisma.user.update({
        where: { id: userId.toString() },
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
        },
      });

      return {
        message: 'Perfil atualizado com sucesso',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
        },
      };
    }),
  getMe: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const user = await ctx.prisma.user.findUnique({
      where: { id: userId.toString() },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Usuário não encontrado',
      });
    }

    return user;
  }),
});
