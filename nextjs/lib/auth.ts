import prisma from '../client';
import { generateHash, generateSalt } from '../utilities/password';
import { PrismaClient, Prisma, auths } from '@prisma/client';
import type { Adapter, AdapterUser } from 'next-auth/adapters';
import { sendNotification } from 'services/slack';
import { skipNotification } from 'services/slack/api/notification';

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
    !skipNotification() && sendNotification('Email created: ' + a.email),
  ]).then(() => {
    return a;
  });
};

const parseAuthToAdapterUser = ({
  email,
  emailVerified,
  id,
  displayName,
  profileImageUrl,
}: auths): AdapterUser => ({
  email,
  emailVerified,
  id,
  name: displayName,
  image: profileImageUrl,
});

const parseAdapterUserToAuth = ({
  email,
  emailVerified,
  name,
  image,
}: Partial<AdapterUser>): Prisma.authsCreateInput => {
  return {
    email: email!,
    emailVerified,
    password: '', // we should deprecate this field (or make it optional)
    salt: '', // we should deprecate this field (or make it optional)
    displayName: name,
    profileImageUrl: image,
  };
};

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

    updateUser: ({ id, ...data }) =>
      p.auths
        .update({ where: { id }, data: parseAdapterUserToAuth(data) })
        .then((e) => e && parseAuthToAdapterUser(e)),

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

    async getUserByAccount(provider_providerAccountId) {
      const account = await p.oauthAccounts.findUnique({
        where: { provider_providerAccountId },
        select: { user: true },
      });
      return account?.user ?? null;
    },

    linkAccount: (data) => p.oauthAccounts.create({ data }) as any,

    unlinkAccount: (provider_providerAccountId) =>
      p.oauthAccounts.delete({
        where: { provider_providerAccountId },
      }) as any,
  };
}

const processFailure = (error: unknown) => {
  // If token already used/deleted, just return null
  // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
  if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025')
    return null;
  throw error;
};
