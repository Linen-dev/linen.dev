import prisma from '../client';
import { generateHash, generateSalt } from '../utilities/password';
import { PrismaClient, Prisma, auths } from '@prisma/client';
import type { Adapter, AdapterUser } from 'next-auth/adapters';
import { sendNotification } from 'services/slack';
import { skipNotification } from 'services/slack/api/notification';
import { eventSignUp } from 'services/events/eventNewSignUp';

interface CreateAuthParams {
  email: string;
  password: string;
}

export async function createAuth({ email, password }: CreateAuthParams) {
  const salt = generateSalt();
  const hash = generateHash(password, salt);

  return prisma.auths.create({
    data: {
      salt,
      password: hash,
      email,
    },
  });
}

const notifyNewUser = (a: auths) => {
  return Promise.allSettled([
    !skipNotification() && eventSignUp(a.id, a.email, a.createdAt),
  ]).then(() => {
    return a;
  });
};

const parseAuthToAdapterUser = ({
  email,
  emailVerified,
  id,
}: auths): AdapterUser => ({ email, emailVerified, id });

const parseAdapterUserToAuth = ({
  email,
  emailVerified,
}: Partial<AdapterUser>): Prisma.authsCreateInput => ({
  email: email as string,
  emailVerified,
  password: '', // we should deprecate this field (or make it optional)
  salt: '', // we should deprecate this field (or make it optional)
});

// copy from https://github.com/nextauthjs/next-auth/blob/main/packages/adapter-prisma/src/index.ts
export function CustomPrismaAdapter(p: PrismaClient): Adapter {
  return {
    createUser: (data) =>
      p.auths
        .create({ data: parseAdapterUserToAuth(data) })
        .then(notifyNewUser)
        .then(parseAuthToAdapterUser),

    getUser: (id) =>
      p.auths
        .findUnique({ where: { id } })
        .then((e) => e && parseAuthToAdapterUser(e)),

    getUserByEmail: (email) =>
      p.auths
        .findUnique({ where: { email } })
        .then((e) => e && parseAuthToAdapterUser(e)),

    async updateUser({ id, ...data }) {
      // used for update emailVerified field that we don't have
      return await p.auths
        .update({ where: { id }, data: { emailVerified: data.emailVerified } })
        .then((e) => e && parseAuthToAdapterUser(e));
    },

    async getSessionAndUser(sessionToken) {
      const userAndSession = await p.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!userAndSession) return null;
      const { user, ...session } = userAndSession;
      return { user: parseAuthToAdapterUser(user), session };
    },

    createSession: (data) => p.session.create({ data }),

    updateSession: (data) =>
      p.session.update({ where: { sessionToken: data.sessionToken }, data }),

    async deleteSession(sessionToken) {
      try {
        return await p.session.delete({ where: { sessionToken } });
      } catch (error) {
        return processFailure(error);
      }
    },

    async createVerificationToken(data) {
      return await p.verificationToken.create({
        data,
      });
    },

    async useVerificationToken(identifier_token) {
      try {
        return await p.verificationToken.delete({
          where: { identifier_token },
        });
      } catch (error) {
        return processFailure(error);
      }
    },

    // @ts-ignore
    deleteUser: (id) => new Error(),

    // TODO: functions that we need to implement to allow social login
    // async getUserByAccount(provider_providerAccountId) {
    //   const account = await p.account.findUnique({
    //     where: { provider_providerAccountId },
    //     select: { user: true },
    //   })
    //   return account?.user ?? null
    // },

    // linkAccount: (data) => p.account.create({ data }) as any,

    // unlinkAccount: (provider_providerAccountId) =>
    //   p.account.delete({ where: { provider_providerAccountId } }) as any,
  };
}

const processFailure = (error: unknown) => {
  // If token already used/deleted, just return null
  // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
  if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025')
    return null;
  throw error;
};
