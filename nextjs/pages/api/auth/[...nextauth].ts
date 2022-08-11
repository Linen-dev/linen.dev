import NextAuth, { type NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import prisma from '../../../client';
import { CustomPrismaAdapter } from 'lib/auth';
import SignInMailer from 'mailers/SignInMailer';
import * as Sentry from '@sentry/nextjs';

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
      from: 'Linen.dev <no-reply@linendev.com>',

      async sendVerificationRequest(params) {
        try {
          const { identifier, url, provider, theme } = params;

          const result = await SignInMailer.send({
            to: identifier,
            url,
          });

          const failed = result.rejected.concat(result.pending).filter(Boolean);
          if (failed.length) {
            throw new Error(
              `Email(s) (${failed.join(', ')}) could not be sent`
            );
          }
        } catch (error) {
          Sentry.captureException(error);
          await Sentry.flush(2000);
          throw error;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET as string,
} as NextAuthOptions;

export default NextAuth(authOptions);
