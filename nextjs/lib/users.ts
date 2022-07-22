import { ChannelWithAccountAndSlackAuth, UserMap } from '../types/partialTypes';
import prisma from '../client';
import type { Prisma } from '@prisma/client';
import { UserInfo } from '../types/slackResponses//slackUserInfoInterface';
import { generateRandomWordSlug } from '../utilities/randomWordSlugs';
import { getSlackUser } from '../services/slack';

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

export const findOrCreateUser = async (
  user: Prisma.usersUncheckedCreateInput
) => {
  return await prisma.users.upsert({
    where: {
      externalUserId_accountsId: {
        accountsId: user.accountsId,
        externalUserId: user.externalUserId,
      },
    },
    update: {},
    create: user,
  });
};

export const findUser = async (userId: string, accountId: string) => {
  return await prisma.users.findUnique({
    where: {
      externalUserId_accountsId: {
        accountsId: accountId,
        externalUserId: userId,
      },
    },
  });
};

export const createUser = async (user: Prisma.usersUncheckedCreateInput) => {
  return await prisma.users.create({ data: user });
};

export const createUserFromUserInfo = async (
  user: UserInfo,
  accountId: string
) => {
  const profile = user.profile;
  const name =
    profile.display_name ||
    profile.display_name_normalized ||
    profile.real_name ||
    profile.real_name_normalized;
  const profileImageUrl = profile.image_original;
  const param = {
    displayName: name,
    externalUserId: user.id,
    profileImageUrl,
    accountsId: accountId,
    isBot: user.is_bot,
    isAdmin: user.is_admin || false,
    anonymousAlias: generateRandomWordSlug(),
  };

  return await createUser(param);
};

export const createManyUsers = async (users: Prisma.usersCreateManyArgs) => {
  return await prisma.users.createMany(users);
};

export const listUsers = async (accountId: string) => {
  return await prisma.users.findMany({ where: { accountsId: accountId } });
};

export const findOrCreateUserFromUserInfo = async (
  externalUserId: string,
  channel: ChannelWithAccountAndSlackAuth
) => {
  let user = await findUser(externalUserId, channel.accountId as string);
  if (user === null) {
    const accessToken = channel.account?.slackAuthorizations[0]?.accessToken;
    if (!!accessToken) {
      const slackUser = await getSlackUser(externalUserId, accessToken);
      //check done above in channel check
      user = await createUserFromUserInfo(slackUser, channel.accountId!);
    }
  }
  return user;
};
