import prisma from 'client';
import { users } from '@prisma/client';
import {
  DiscordMessage,
  Author,
  GuildMember,
} from 'types/discordResponses/discordMessagesInterface';
import { generateRandomWordSlug } from 'utilities/randomWordSlugs';
import { LIMIT } from './constrains';
import { getDiscordWithRetry } from './api';

export function buildUserAvatar({
  userId,
  avatarId,
}: {
  userId: string;
  avatarId: string;
}): string {
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarId}.png`;
}

export function getMentions(mentions: Author[] | undefined, users: users[]) {
  function reduceMentions(previous: { usersId: string }[], current: Author) {
    const usersId = users.find(
      (user) => user.externalUserId === current.id
    )?.id;
    return [...previous, ...(usersId ? [{ usersId }] : [])];
  }
  return mentions && mentions.reduce(reduceMentions, []);
}

async function createUsers(accountId: string, usersInMessages: Author[]) {
  return await prisma.$transaction(
    usersInMessages.map((user) => {
      return prisma.users.upsert({
        create: {
          externalUserId: user.id,
          accountsId: accountId,
          displayName: user.username,
          anonymousAlias: generateRandomWordSlug(),
          isAdmin: false,
          isBot: user.bot || false,
          ...(user.avatar && {
            profileImageUrl: buildUserAvatar({
              userId: user.id,
              avatarId: user.avatar,
            }),
          }),
        },
        // we may remove the update for users with deleted flag
        update: {
          displayName: user.username,
          ...(user.avatar && {
            profileImageUrl: buildUserAvatar({
              userId: user.id,
              avatarId: user.avatar,
            }),
          }),
        },
        where: {
          externalUserId_accountsId: {
            accountsId: accountId,
            externalUserId: user.id,
          },
        },
      });
    })
  );
}

export async function findUsers(accountId: string, usersInMessages: Author[]) {
  return await prisma.users.findMany({
    where: {
      externalUserId: { in: usersInMessages.map((u) => u.id) },
      account: { id: accountId },
    },
  });
}

export function getUsersInMessages(messages: DiscordMessage[]) {
  return messages.reduce((acc: Author[], message) => {
    // type 0 + 21
    acc.push(message.author);
    message.mentions && acc.push(...message.mentions);
    //  type 21
    if (message.referenced_message) {
      acc.push(message.referenced_message?.author);
      message.referenced_message?.mentions &&
        acc.push(...message.referenced_message?.mentions);
    }
    return acc;
  }, []);
}

export async function crawlUsers({
  accountId,
  discordId,
  token,
}: {
  accountId: string;
  discordId: string;
  token: string;
}) {
  let hasMore = true;
  let after;
  do {
    const users: GuildMember[] = await getDiscordWithRetry({
      path: `/guilds/${discordId}/members`,
      query: { limit: LIMIT, after },
      token,
    });
    await createUsers(
      accountId,
      users.map((user) => {
        return {
          discriminator: user.user?.discriminator as string,
          id: user.user?.id as string,
          username: user.nick || user.user?.username || 'unknown',
          bot: user.user?.bot,
          avatar: user.avatar || user.user?.avatar,
        };
      })
    );
    console.log('users.length', users.length);
    if (users.length) {
      after = users.pop()?.user?.id;
    } else {
      hasMore = false;
    }
  } while (hasMore);
}
