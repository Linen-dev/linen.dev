import { users } from '@linen/database';
import {
  DiscordMessage,
  DiscordAuthor,
  DiscordGuildMember,
} from '@linen/types';
import { generateRandomWordSlug } from '@linen/utilities/randomWordSlugs';
import { LIMIT } from './constrains';
import DiscordApi from './api';
import to from '@linen/utilities/await-to-js';
import UsersService from 'services/users';
import Logger from './logger';
import { toObject } from '@linen/utilities/object';

// helper for messages
export function getMentions(
  mentions: DiscordAuthor[] | undefined,
  users: users[]
) {
  function reduceMentions(
    previous: { usersId: string }[],
    current: DiscordAuthor
  ) {
    const usersId = users.find(
      (user) => user.externalUserId === current.id
    )?.id;
    return [...previous, ...(usersId ? [{ usersId }] : [])];
  }
  return mentions && mentions.reduce(reduceMentions, []);
}

// helper for messages
export function getUsersInMessages(messages: DiscordMessage[]) {
  return messages.reduce((acc: DiscordAuthor[], message) => {
    acc.push(message.author);
    message.mentions && acc.push(...message.mentions);
    return acc;
  }, []);
}

export async function crawlUsers({
  accountId,
  serverId,
  token,
  logger,
}: {
  accountId: string;
  serverId: string;
  token: string;
  logger: Logger;
}) {
  logger.log('crawlUsers >> started');
  let hasMore = true;
  let after;
  do {
    const [err, response] = await to(
      DiscordApi.getDiscordUsers({ limit: LIMIT, serverId, token, after })
    );
    if (err) {
      logger.error(`crawlUsers >> finished with failure: ${err}`);
      return;
    }
    const users = response as DiscordGuildMember[];
    await Promise.all(
      users.map((u) => parseUser(u, accountId)).map(UsersService.upsertUser)
    );
    logger.log(`users found: ${users.length}`);
    if (users.length) {
      after = users.pop()?.user?.id;
    } else {
      hasMore = false;
    }
  } while (hasMore);
  logger.log('crawlUsers >> finished');
}

const parseUser = (guildMember: DiscordGuildMember, accountId: string) => {
  return {
    externalUserId: guildMember.user?.id!,
    accountsId: accountId,
    displayName: guildMember.nick || guildMember.user?.username || 'unknown',
    anonymousAlias: generateRandomWordSlug(),
    isAdmin: false,
    isBot: guildMember.user?.bot || false,
    ...((guildMember.avatar || guildMember.user?.avatar) && {
      profileImageUrl: buildUserAvatar({
        userId: guildMember.user?.id!,
        avatarId: guildMember.avatar || guildMember.user?.avatar!,
      }),
    }),
  };
};

function buildUserAvatar({
  userId,
  avatarId,
}: {
  userId: string;
  avatarId: string;
}): string {
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarId}.png`;
}

export async function findUsers(
  accountId: string,
  usersInMessages: DiscordAuthor[]
) {
  const usersToReturn = toObject(usersInMessages, 'id');
  const usersStatus: Record<string, boolean> = {};
  const usersFromStore = await UsersService.findUsersByExternalId({
    accountId,
    externalIds: usersInMessages.map((u) => u.id),
  });
  usersFromStore.forEach((u) => {
    if (u.externalUserId && usersToReturn[u.externalUserId]) {
      usersStatus[u.externalUserId] = true;
    }
  });
  usersInMessages.forEach((u) => {
    if (!usersStatus[u.id]) {
      usersStatus[u.id] = false;
    }
  });
  const usersToCreate = Object.keys(usersStatus).filter(
    (k) => usersStatus[k] === false
  );
  await Promise.all(
    usersToCreate.map(async (externalId) => {
      const dataFromDiscord = usersToReturn[externalId];
      const toInsert = parseAuthor(dataFromDiscord, accountId);
      usersFromStore.push(await UsersService.upsertUser(toInsert));
    })
  );
  return usersFromStore;
}

const parseAuthor = (author: DiscordAuthor, accountId: string) => {
  return {
    externalUserId: author.id,
    accountsId: accountId,
    displayName: author.username,
    anonymousAlias: generateRandomWordSlug(),
    isAdmin: false,
    isBot: author.bot || false,
    ...(author.avatar && {
      profileImageUrl: buildUserAvatar({
        userId: author.id,
        avatarId: author.avatar,
      }),
    }),
  };
};
