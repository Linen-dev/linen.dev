import { Roles } from '@linen/types';
import { prisma } from '@linen/database';
import { eventSignUp } from 'services/events/eventNewSignUp';
import {
  generateHash,
  generateSalt,
  secureCompare,
} from '@linen/utilities/password';
import { generateRandomWordSlug } from '@linen/utilities/randomWordSlugs';
import { v4 } from 'uuid';

interface CreateAuthParams {
  email: string;
  password: string;
}

export default class UsersService {
  static async updateUserRole({
    userId,
    role,
  }: {
    userId: string;
    role: Roles;
  }) {
    const userToUpdate = await prisma.users.findUnique({
      where: { id: userId },
    });
    if (!userToUpdate) {
      throw 'user not found';
    }

    // the account it should have at least another owner
    if (userToUpdate.role === Roles.OWNER && role !== Roles.OWNER) {
      const anotherOwner = await prisma.users.findFirst({
        where: {
          accountsId: userToUpdate.accountsId,
          role: Roles.OWNER,
          NOT: {
            id: userToUpdate.id,
          },
        },
      });
      if (!anotherOwner) {
        throw 'the account need at least one owner';
      }
    }
    return await prisma.users.update({
      where: { id: userToUpdate.id },
      data: {
        role,
      },
    });
  }
  static async updateTenant({
    authId,
    accountId,
  }: {
    authId: string;
    accountId: string;
  }) {
    await prisma.auths.update({
      where: {
        id: authId,
      },
      data: { accountId },
    });
  }
  static async getUserById(id: string) {
    return await prisma.auths.findUnique({
      where: { id },
      select: { email: true, id: true, users: true },
    });
  }
  static async authorize(email: string, password: string) {
    if (!email || !password) {
      return null;
    }
    const auth = await prisma.auths.findUnique({ where: { email } });
    if (!auth) {
      return null;
    }
    if (secureCompare(auth.password, generateHash(password, auth.salt))) {
      return {
        email: auth.email,
        id: auth.id,
      };
    }
    return null;
  }
  static async getOrCreateUserWithEmail(email: string) {
    const auth = await prisma.auths.findUnique({ where: { email } });
    if (auth) return auth;

    const newAuth = await prisma.auths.create({
      data: {
        email,
        password: v4(),
        salt: v4(),
        emailVerified: new Date(),
      },
    });

    await eventSignUp(newAuth.id, email, newAuth.createdAt);
    return newAuth;
  }
  static async createAuth({ email, password }: CreateAuthParams) {
    const salt = generateSalt();
    const hash = generateHash(password, salt);

    return prisma.auths.create({
      data: {
        salt,
        password: hash,
        email: String(email).toLowerCase(),
      },
    });
  }
  static async upsertUser({
    isAdmin = false,
    isBot = false,
    anonymousAlias = generateRandomWordSlug(),
    ...user
  }: {
    externalUserId: string;
    accountsId: string;
    isAdmin?: boolean;
    isBot?: boolean;
    displayName: string;
    anonymousAlias?: string;
    profileImageUrl?: string;
    role?: Roles;
  }) {
    return prisma.users.upsert({
      create: {
        ...user,
        isAdmin,
        isBot,
        anonymousAlias,
      },
      update: {
        displayName: user.displayName,
        profileImageUrl: user.profileImageUrl,
      },
      where: {
        externalUserId_accountsId: {
          accountsId: user.accountsId,
          externalUserId: user.externalUserId!,
        },
      },
    });
  }
  static async findUsersByExternalId({
    accountId,
    externalIds,
  }: {
    accountId: string;
    externalIds: string[];
  }) {
    return await prisma.users.findMany({
      where: {
        externalUserId: { in: externalIds },
        account: { id: accountId },
      },
    });
  }
}
