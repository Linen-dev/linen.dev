import { Prisma, prisma } from '@linen/database';
import { UserMap } from '@linen/types';
import { eventUserNameUpdate } from 'services/events/eventUserNameUpdate';
import UsersService from './users';
export default UsersService;

export const findAuthByEmail = async (email: string) => {
  return await prisma.auths.findUnique({
    where: { email },
    include: { users: { include: { account: true } } },
  });
};

export const createManyUsers = async (users: Prisma.usersCreateManyArgs) => {
  return await prisma.users.createMany(users);
};

export async function findUsersByAccountId(
  accountId: string
): Promise<UserMap[]> {
  return await prisma.users.findMany({
    where: { accountsId: accountId },
    select: {
      externalUserId: true,
      id: true,
    },
  });
}

export const findUser = async (
  externalUserId: string,
  internalAccountId: string
) => {
  return await prisma.users.findUnique({
    where: {
      externalUserId_accountsId: {
        accountsId: internalAccountId,
        externalUserId,
      },
    },
  });
};

export const createUser = async (user: Prisma.usersUncheckedCreateInput) => {
  if (user.accountsId && user.externalUserId) {
    const exist = await prisma.users.findUnique({
      where: {
        externalUserId_accountsId: {
          accountsId: user.accountsId,
          externalUserId: user.externalUserId!,
        },
      },
    });
    if (exist) {
      return exist;
    }
  }
  return await prisma.users.create({ data: user });
};

export const updateUser = async (user: Prisma.usersUncheckedCreateInput) => {
  const { anonymousAlias, ...param } = user;
  if (!user.id) {
    throw new Error('missing userId');
  }
  const old = await prisma.users.findUnique({
    select: { displayName: true },
    where: { id: user.id },
  });
  const newUser = await prisma.users.update({
    data: {
      ...param,
    },
    where: {
      id: user.id,
    },
  });
  if (old?.displayName !== user.displayName) {
    await eventUserNameUpdate({
      userId: user.id,
      accountId: user.accountsId,
    });
  }
  return newUser;
};
