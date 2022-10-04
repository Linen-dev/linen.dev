import NextAuth, { type NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import prisma from 'client';
import { CustomPrismaAdapter } from 'lib/auth';
import SignInMailer from 'mailers/SignInMailer';
import { captureException, flush } from '@sentry/nextjs';
import { NOREPLY_EMAIL } from 'secrets';
import CredentialsProvider from 'next-auth/providers/credentials';
import { generateHash } from 'utilities/password';

export const authOptions = {
  pages: {
    signIn: '/signin',
    error: '/signin',
    verifyRequest: '/verify-request',
  },
  adapter: CustomPrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_HOST,
        port: 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      },
      from: `Linen.dev <${NOREPLY_EMAIL}>`,

      async sendVerificationRequest(params) {
        try {
          const { identifier, url } = params;

          const result = await SignInMailer.send({
            to: identifier,
            url,
          });

          const failed = result?.rejected
            ?.concat(result.pending)
            .filter(Boolean);
          if (failed && failed.length) {
            throw new Error(
              `Email(s) (${failed.join(', ')}) could not be sent`
            );
          }
        } catch (error) {
          captureException(error);
          await flush(1000);
        }
      },
    }),
    CredentialsProvider({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        if (!credentials) {
          return null;
        }
        const { email, password } = credentials;
        if (!email || !password) {
          return null;
        }
        const auth = await prisma.auths.findUnique({ where: { email } });
        if (!auth) {
          return null;
        }
        if (auth.password === generateHash(password, auth.salt)) {
          return {
            email: auth.email,
            id: auth.id,
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, isNewUser, profile, user }: any) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token, user }: any) {
      session.user.id = token.id;
      return session;
    },
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET as string,
} as NextAuthOptions;

export default NextAuth(authOptions);
