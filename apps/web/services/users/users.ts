import { Roles } from '@linen/types';
import prisma from 'client';

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
}
