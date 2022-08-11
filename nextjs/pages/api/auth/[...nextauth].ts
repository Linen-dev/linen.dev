import NextAuth, { type NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import prisma from '../../../client';
import { CustomPrismaAdapter } from 'lib/auth';
import ApplicationMailer from 'mailers/ApplicationMailer';

export const authOptions = {
  pages: {
    signIn: '/signin',
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
        const { identifier, url, provider, theme } = params;
        const { host } = new URL(url);

        const result = await ApplicationMailer.send({
          to: identifier,
          from: provider.from,
          subject: `Sign in to Linen.dev`,
          text: `Sign in to Linen.dev\n${url}`,
          html: `Sign in to Linen.dev\n${url}`,
        });

        const failed = result.rejected.concat(result.pending).filter(Boolean);
        if (failed.length) {
          throw new Error(`Email(s) (${failed.join(', ')}) could not be sent`);
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET as string,
} as NextAuthOptions;

export default NextAuth(authOptions);
