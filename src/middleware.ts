/* eslint-disable consistent-return */
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { env } from '@/env';

export const DEFAULT_LOGIN_REDIRECT = '/dashboard';
export const AUTH_PAGE = '/auth/login';

const authRoutes = '/auth/';
const publicRoutes = ['/'];

/**
 * Tudo que cair no matcher vai ser executado pelo middleware
 * Rotas excluidas: /api/ /trcp/ /_next/ /public/ /favicon.ico
 */
export const config = {
  matcher: ['/((?!\\bapi\\b|\\btrpc\\b|_next|.*\\..*|favicon.ico).*)'],
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function middleware(request: NextRequest) {
  const { nextUrl } = request;

  const session = await getToken({
    req: request,
    secret: env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = !!session;
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = nextUrl.pathname.startsWith(authRoutes);

  console.log(
    '================== middleware start\n',
    session,
    '\n================== middleware end',
  );

  // Se for rota publica pode acessar
  if (isPublicRoute)
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.url));

  // Se for rota de autenticação e o usuário não estiver logado, permite acesso
  if (!isLoggedIn && isAuthRoute) return;

  // Se o usuário não estiver logado, redirecionar pra página de login
  if (!isLoggedIn)
    return NextResponse.redirect(new URL(AUTH_PAGE, request.url));
}
