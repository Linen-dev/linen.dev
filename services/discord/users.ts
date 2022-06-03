import prisma from '../../client';
import { users } from '@prisma/client';
import {
  DiscordMessage,
  Author,
} from '../../types/discordResponses/discordMessagesInterface';
import { generateRandomWordSlug } from '../../utilities/randomWordSlugs';

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
    const usersId = users.find((user) => user.slackUserId === current.id)?.id;
    return [...previous, ...(usersId ? [{ usersId }] : [])];
  }
  return mentions && mentions.reduce(reduceMentions, []);
}

export async function createUsers(
  accountId: string,
  usersInMessages: Author[]
) {
  return await prisma.$transaction(
    usersInMessages.map((user) => {
      return prisma.users.upsert({
        create: {
          slackUserId: user.id,
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
          slackUserId_accountsId: {
            accountsId: accountId,
            slackUserId: user.id,
          },
        },
      });
    })
  );
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
