import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import {
  authorizeInvitedOAuthSignIn,
  authorizeUserCredentials,
} from './account-admission';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Work email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        return authorizeUserCredentials(
          credentials?.email,
          credentials?.password
        );
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider === 'credentials') {
        return true;
      }
      return authorizeInvitedOAuthSignIn({
        email: user?.email,
        name: user?.name,
      });
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as { role?: string }).role || 'CREATOR';
        token.status = (user as { status?: string }).status || 'ACTIVE';
      } else if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: String(token.email).toLowerCase() },
        });
        if (!dbUser || dbUser.status !== 'ACTIVE') {
          token.status = 'DISABLED';
        } else {
          token.id = dbUser.id;
          token.name = dbUser.name;
          token.role = dbUser.role;
          token.status = dbUser.status;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.status === 'DISABLED') {
        return { ...session, user: undefined };
      }
      if (session.user) {
        (
          session.user as {
            id?: string;
            role?: string;
            status?: string;
            workspaceId?: string;
            plan?: string;
          }
        ).id = String(token.id || '');
        (session.user as { role?: string }).role = String(
          token.role || 'CREATOR'
        );
        (session.user as { status?: string }).status = String(
          token.status || 'ACTIVE'
        );
      }
      return session;
    },
  },
  secret:
    process.env.NEXTAUTH_SECRET || 'supademo-super-secret-nextauth-key-2026',
};
