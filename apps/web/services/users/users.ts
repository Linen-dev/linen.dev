import { Roles } from '@prisma/client';
import prisma from 'client';
import { generateHash, secureCompare } from 'utilities/password';

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
}
