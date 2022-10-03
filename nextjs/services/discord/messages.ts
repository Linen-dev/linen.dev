import prisma from '../../client';
import { channels, MessageFormat, threads, users } from '@prisma/client';
import { DiscordMessage } from '../../types/discordResponses/discordMessagesInterface';
import { findUsers, getMentions, getUsersInMessages } from './users';

type ProcessMessageType = Record<
  number,
  (
    channel: channels,
    message: DiscordMessage,
    users: users[],
    thread?: threads
  ) => {
    body: string;
    sentAt: string;
    externalMessageId: string;
    threadId?: string;
    channelId: string;
    authorId: string;
    mentions?: { usersId: string }[];
  }
>;

const processMessageTypeMap: ProcessMessageType = {
  0: processMessageType0,
  18: processMessageType18,
  21: processMessageType21,
};

function processMessageType0(
  channel: channels,
  message: DiscordMessage,
  users: users[],
  thread?: threads
) {
  const mentions = getMentions(message.mentions, users);
  const authorId = users.find(
    (user) => user.externalUserId === message.author.id
  )?.id as string;
  return {
    authorId,
    body: message.content,
    channelId: channel.id,
    sentAt: message.timestamp,
    externalMessageId: message.id,
    threadId: thread?.id,
    mentions,
  };
}

function processMessageType18(
  channel: channels,
  message: DiscordMessage,
  users: users[],
  thread?: threads
) {
  const mentions = getMentions(message.mentions, users);
  const authorId = users.find(
    (user) => user.externalUserId === message.author.id
  )?.id as string;
  return {
    authorId,
    body: message.content,
    channelId: channel.id,
    sentAt: message.timestamp,
    externalMessageId: message.id,
    threadId: thread?.id,
    mentions,
  };
}

function processMessageType21(
  channel: channels,
  message: DiscordMessage,
  users: users[],
  thread?: threads
) {
  // console.log('processMessageType21', message);
  const mentions = getMentions(message.referenced_message?.mentions, users);
  const authorId = users.find(
    (user) => user.externalUserId === message.referenced_message?.author.id
  )?.id as string;

  return {
    authorId,
    body: message.referenced_message?.content as string,
    channelId: channel.id,
    sentAt: message.referenced_message?.timestamp as string,
    externalMessageId: message.referenced_message?.id as string,
    threadId: thread?.id,
    mentions,
  };
}

function upsertMessage(message: {
  body: string;
  sentAt: string;
  externalMessageId: string;
  threadId?: string;
  channelId: string;
  authorId: string;
  mentions?: { usersId: string }[];
}) {
  const toInsert = {
    body: message.body,
    sentAt: message.sentAt,
    externalMessageId: message.externalMessageId,
    threadId: message.threadId,
    channelId: message.channelId,
    usersId: message.authorId,
    messageFormat: MessageFormat.DISCORD,
    ...(message.mentions && {
      mentions: {
        createMany: {
          skipDuplicates: true,
          data: message.mentions,
        },
      },
    }),
  };

  return prisma.messages.upsert({
    create: toInsert,
    update: toInsert,
    where: {
      channelId_externalMessageId: {
        channelId: message.channelId,
        externalMessageId: message.externalMessageId,
      },
    },
  });
}

export function filterKnownMessagesTypes(message: DiscordMessage) {
  if (supportedMessageType.includes(message.type)) {
    return true;
  }
  console.error(
    'message not supported',
    messageTypes[message.type],
    JSON.stringify(message)
  );
  return false;
}

export const supportedMessageType = [0, 18, 21];

export async function createMessages({
  accountId,
  channel,
  thread,
  messages,
}: {
  accountId: string;
  channel: channels;
  thread?: threads;
  messages: DiscordMessage[];
}) {
  const usersInMessages = getUsersInMessages(messages);
  const users = await findUsers(accountId, usersInMessages);
  await Promise.all(
    messages.filter(filterKnownMessagesTypes).map((message) => {
      // console.log('message', message)
      return upsertMessage(
        processMessageTypeMap[message.type](channel, message, users, thread)
      );
    })
  );
}

const messageTypes: any = {
  0: 'DEFAULT',
  1: 'RECIPIENT_ADD',
  2: 'RECIPIENT_REMOVE',
  3: 'CALL',
  4: 'CHANNEL_NAME_CHANGE',
  5: 'CHANNEL_ICON_CHANGE',
  6: 'CHANNEL_PINNED_MESSAGE',
  7: 'GUILD_MEMBER_JOIN',
  8: 'USER_PREMIUM_GUILD_SUBSCRIPTION',
  9: 'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1',
  10: 'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2',
  11: 'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3',
  12: 'CHANNEL_FOLLOW_ADD',
  14: 'GUILD_DISCOVERY_DISQUALIFIED',
  15: 'GUILD_DISCOVERY_REQUALIFIED',
  16: 'GUILD_DISCOVERY_GRACE_PERIOD_INITIAL_WARNING',
  17: 'GUILD_DISCOVERY_GRACE_PERIOD_FINAL_WARNING',
  18: 'THREAD_CREATED',
  19: 'REPLY',
  20: 'CHAT_INPUT_COMMAND',
  21: 'THREAD_STARTER_MESSAGE',
  22: 'GUILD_INVITE_REMINDER',
  23: 'CONTEXT_MENU_COMMAND',
};
