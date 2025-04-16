import { type User } from 'next-auth';
import { loginSchema } from '@/server/validations/auth';
import { prisma } from '../db';
import { verify } from 'argon2';
import lodash from 'lodash';

export async function authorize(
  credentials: Record<'username' | 'password', string> | undefined,
): Promise<User | null> {
  try {
    const creds = await loginSchema.parseAsync(credentials);

    const user = await prisma.user.findFirst({
      where: { email: creds.username.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    });

    if (!user) return null;

    const isValidPassword = await verify(user.password, creds.password);
    if (!isValidPassword) return null;

    const returnUser = lodash.omit(user, ['password']) as User;
    return returnUser;
  } catch (error) {
    console.error('Error:', error);
  }
  return null;
}
