import { Prisma, users, prisma } from '@linen/database';
import { BotInfo, UserInfo, UserMap } from '@linen/types';
import { generateRandomWordSlug } from 'utilities/randomWordSlugs';
import { getSlackBot, getSlackUser } from 'services/slack/api';

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

function buildUserFromInfo(
  user: UserInfo,
  accountId: string
): Prisma.usersUncheckedCreateInput {
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
  return param;
}

function buildUserBotFromInfo(
  bot: BotInfo,
  accountId: string
): Prisma.usersUncheckedCreateInput {
  const param = {
    displayName: bot?.name,
    externalUserId: bot?.id,
    profileImageUrl:
      bot?.icons?.image_72 || bot?.icons?.image_48 || bot?.icons?.image_36,
    accountsId: accountId,
    isBot: true,
    isAdmin: false,
    anonymousAlias: generateRandomWordSlug(),
  };
  return param;
}

export const createUserFromUserInfo = async (
  user: UserInfo,
  accountId: string
) => {
  const param = buildUserFromInfo(user, accountId);
  return await createUser(param);
};

export const createUserFromBotInfo = async (
  user: BotInfo,
  accountId: string
) => {
  const param = buildUserBotFromInfo(user, accountId);
  return await createUser(param);
};

export const updateUserFromUserInfo = async (
  user: users,
  userInfo: UserInfo,
  accountId: string
) => {
  const param = buildUserFromInfo(userInfo, accountId);
  return await prisma.users.update({
    data: {
      ...param,
      anonymousAlias: user.anonymousAlias,
    },
    where: {
      id: user.id,
    },
  });
};

export const createManyUsers = async (users: Prisma.usersCreateManyArgs) => {
  return await prisma.users.createMany(users);
};

export const listUsers = async (accountId: string) => {
  return await prisma.users.findMany({ where: { accountsId: accountId } });
};

export const findOrCreateUserFromUserInfo = async (
  externalUserId: string,
  accountId: string,
  accessToken?: string
) => {
  let user = await findUser(externalUserId, accountId);
  if (user === null) {
    if (!!accessToken) {
      let slackUser = await getSlackUser(externalUserId, accessToken);
      if (!!slackUser) {
        return await createUserFromUserInfo(slackUser, accountId!);
      }
      let botUser = await getSlackBot(externalUserId, accessToken);
      if (!!botUser) {
        return await createUserFromBotInfo(botUser, accountId!);
      }
    }
  }
  return user;
};

export const createOrUpdateUser = async (user: UserInfo, accountId: string) => {
  const { anonymousAlias, ...userInfo } = buildUserFromInfo(user, accountId);
  return await prisma.users.upsert({
    where: {
      externalUserId_accountsId: {
        accountsId: accountId,
        externalUserId: user.id,
      },
    },
    update: userInfo,
    create: { anonymousAlias, ...userInfo },
  });
};

export const findAuthByEmail = async (email: string) => {
  return await prisma.auths.findUnique({
    where: { email },
    include: { users: { include: { account: true } } },
  });
};
