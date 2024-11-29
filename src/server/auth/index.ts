import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";

import { prisma } from "@/server/db";
import Credentials from "next-auth/providers/credentials";
import { authorize } from "./authorize";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string;
      name: string;
      email: string;
      account_type: string;
      access_token: string;
      expires_at: string;
      phone: string;
      // ...other properties
      // role: UserRole;
      status: string;
      document: string;
      bank: UserBank;
      otp: UserOTP;
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
    name: string;
    phone: string;
    email: string;
    account_type: string;
    access_token: string;
    expires_at: string;
    status: string;
    document: string;
    bank: UserBank;
    otp: UserOTP;
  }
}

interface UserBank {
  manager_id: string | null;
  bank_number: string | null;
  branch_number: string | null;
  branch_digit: string | null;
  account_number: string | null;
  account_digit: string | null;
  account_type: string | null;
}

interface UserOTP {
  secret: string;
  issuer: string;
  algorithm: string;
  digits: number;
  period: number;
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 1 * 24 * 30 * 60, // 1 days
  },
  pages: {
    signIn: "/login",
    // newUser: "/auth/register",
  },
  callbacks: {
    jwt: ({ token, user, trigger, session }) => {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.name = user.name;
        token.email = user.email;
        token.account_type = user.account_type;
        token.access_token = user.access_token;
        token.expires_at = user.expires_at;
        token.document = user.document;
        token.phone = user.phone;
        token.status = user.status;
        token.bank = user.bank;
        token.otp = user.otp;
      }
      // if (trigger === "update" && session?.companyId) {
      //   token.companyId = session.companyId;
      // }
      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.account_type = token.account_type as string;
        session.user.access_token = token.access_token as string;
        session.user.expires_at = token.expires_at as string;
        session.user.document = token.document as string;
        session.user.phone = token.phone as string;
        session.user.status = token.status as string;
        session.user.bank = token.bank as UserBank;
        session.user.otp = token.otp as UserOTP;
      }
      return session;
    },
  },
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Usuário", type: "username" },
        password: { label: "Senha", type: "password" },
      },
      authorize,
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
