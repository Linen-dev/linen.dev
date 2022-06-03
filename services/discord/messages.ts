import prisma from '../../client';
import { channels, slackThreads, users } from '@prisma/client';
import { DiscordMessage } from '../../types/discordResponses/discordMessagesInterface';
import { createUsers, getMentions, getUsersInMessages } from './users';

type ProcessMessageType = Record<
  number,
  (
    channel: channels,
    message: DiscordMessage,
    users: users[],
    thread?: slackThreads
  ) => {
    body: string;
    sentAt: string;
    slackMessageId: string;
    slackThreadId?: string;
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
  thread?: slackThreads
) {
  const mentions = getMentions(message.mentions, users);
  const authorId = users.find((user) => user.slackUserId === message.author.id)
    ?.id as string;
  return {
    authorId,
    body: message.content,
    channelId: channel.id,
    sentAt: message.timestamp,
    slackMessageId: message.id,
    slackThreadId: thread?.id,
    mentions,
  };
}

function processMessageType18(
  channel: channels,
  message: DiscordMessage,
  users: users[],
  thread?: slackThreads
) {
  const mentions = getMentions(message.mentions, users);
  const authorId = users.find((user) => user.slackUserId === message.author.id)
    ?.id as string;
  return {
    authorId,
    body: message.content,
    channelId: channel.id,
    sentAt: message.timestamp,
    slackMessageId: message.id,
    slackThreadId: thread?.id,
    mentions,
  };
}

function processMessageType21(
  channel: channels,
  message: DiscordMessage,
  users: users[],
  thread?: slackThreads
) {
  // console.log('processMessageType21', message);
  const mentions = getMentions(message.referenced_message?.mentions, users);
  const authorId = users.find(
    (user) => user.slackUserId === message.referenced_message?.author.id
  )?.id as string;

  return {
    authorId,
    body: message.referenced_message?.content as string,
    channelId: channel.id,
    sentAt: message.referenced_message?.timestamp as string,
    slackMessageId: message.referenced_message?.id as string,
    slackThreadId: thread?.id,
    mentions,
  };
}

function upsertMessage(message: {
  body: string;
  sentAt: string;
  slackMessageId: string;
  slackThreadId?: string;
  channelId: string;
  authorId: string;
  mentions?: { usersId: string }[];
}) {
  const toInsert = {
    body: message.body,
    sentAt: message.sentAt,
    slackMessageId: message.slackMessageId,
    slackThreadId: message.slackThreadId,
    channelId: message.channelId,
    usersId: message.authorId,
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
      channelId_slackMessageId: {
        channelId: message.channelId,
        slackMessageId: message.slackMessageId,
      },
    },
  });
}

function filterKnownMessagesTypes(message: DiscordMessage) {
  if (supportedMessageType.includes(message.type)) {
    return true;
  }
  console.error('message not supported', message);
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
  thread?: slackThreads;
  messages: DiscordMessage[];
}) {
  const usersInMessages = getUsersInMessages(messages);
  const users = await createUsers(accountId, usersInMessages);
  await Promise.all(
    messages.filter(filterKnownMessagesTypes).map((message) => {
      // console.log('message', message)
      return upsertMessage(
        processMessageTypeMap[message.type](channel, message, users, thread)
      );
    })
  );
}

// enum messageTypes {
//   'DEFAULT' = 0,
//   'RECIPIENT_ADD' = 1,
//   'RECIPIENT_REMOVE' = 2,
//   'CALL' = 3,
//   'CHANNEL_NAME_CHANGE' = 4,
//   'CHANNEL_ICON_CHANGE' = 5,
//   'CHANNEL_PINNED_MESSAGE' = 6,
//   'GUILD_MEMBER_JOIN' = 7,
//   'USER_PREMIUM_GUILD_SUBSCRIPTION' = 8,
//   'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1' = 9,
//   'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2' = 10,
//   'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3' = 11,
//   'CHANNEL_FOLLOW_ADD' = 12,
//   'GUILD_DISCOVERY_DISQUALIFIED' = 14,
//   'GUILD_DISCOVERY_REQUALIFIED' = 15,
//   'GUILD_DISCOVERY_GRACE_PERIOD_INITIAL_WARNING' = 16,
//   'GUILD_DISCOVERY_GRACE_PERIOD_FINAL_WARNING' = 17,
//   'THREAD_CREATED' = 18,
//   'REPLY' = 19,
//   'CHAT_INPUT_COMMAND' = 20,
//   'THREAD_STARTER_MESSAGE' = 21,
//   'GUILD_INVITE_REMINDER' = 22,
//   'CONTEXT_MENU_COMMAND' = 23,
// }
