import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '../../../client';
import { generateHash } from '../../../utilities/password';

interface Credentials {
  email?: string;
  password?: string;
}

export default NextAuth({
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    redirect({ url, baseUrl }) {
      console.log('URL', url);
      console.log('BASE_URL', baseUrl);
      return baseUrl;
    },
  },
  providers: [
    CredentialsProvider({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        const { email, password } = credentials as Credentials;
        if (!email || !password) {
          return null;
        }
        const auth = await prisma.auths.findFirst({ where: { email } });
        if (!auth) {
          return null;
        }
        if (auth.password === generateHash(password, auth.salt)) {
          return auth;
        }

        return null;
      },
    }),
  ],
});
