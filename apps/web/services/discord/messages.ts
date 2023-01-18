import prisma from 'client';
import { channels, threads, users } from '@prisma/client';
import { MessageFormat } from '@linen/types';
import { DiscordMessage } from 'types/discord';
import { findUsers, getMentions, getUsersInMessages } from './users';
import { CrawlType, LIMIT } from './constrains';
import { createSlug } from 'utilities/util';
import { parseDiscordSentAt } from 'utilities/sentAt';
import ChannelsService from 'services/channels';
import { upsertThreadByExternalId } from 'lib/threads';
import DiscordApi from './api';
import to from 'utilities/await-to-js';

export async function getMessages({
  channel,
  onboardingTimestamp,
  crawlType,
  token,
}: {
  channel: channels;
  onboardingTimestamp: Date;
  crawlType: CrawlType;
  token: string;
}) {
  console.log('getMessages >> started');
  const { cursor } = await crawlChannel({
    channel,
    onboardingTimestamp,
    crawlType,
    token,
  });

  // if everything is fine, persist cursor
  if (cursor) {
    await ChannelsService.updateCursor(channel.id, cursor);
  }
  console.log('getMessages >> finished');
}

async function crawlChannel({
  channel,
  onboardingTimestamp,
  crawlType,
  token,
}: {
  channel: channels;
  onboardingTimestamp: Date;
  crawlType: CrawlType;
  token: string;
}): Promise<{
  channelMessages?: DiscordMessage[];
  cursor?: string;
}> {
  const channelMessages: DiscordMessage[] = [];

  let hasMore = true;
  // before will have the last messageId from request to be used on next pagination request
  let before;
  // cursor/after should be the first messageId receive from the last run
  let after = channel.externalPageCursor || undefined;
  while (hasMore) {
    const query = {
      // before should have priority because the API always return messages sort by timestamp desc
      // so in the second run we will have a cursor assign, we should use it to get messages from the cursorId forward
      // but if there is more than the limit, we will need to paginate backwards, so in case of hasMore
      // we will need to use the "before" parameter, that has the oldest message from the latest batch
      ...(before ? { before } : { after }),
    };
    // if query has after, it means we should clean up the after variable to receive a new cursor
    if ('after' in query) {
      after = undefined;
    }
    // messages are return in desc timestamp order
    const [err, response] = await to(
      DiscordApi.getMessages({
        limit: LIMIT,
        externalId: channel.externalChannelId!,
        query,
        token,
      })
    );
    if (err) {
      console.warn('crawlChannel failure:', err);
      break;
    }
    const messages = response as DiscordMessage[];
    // if there is less than the limit, means that there is no more messages
    if (messages.length < LIMIT) {
      hasMore = false;
    }
    for (const message of messages) {
      if (!after) {
        after = message.id;
      }
      // if we found messages that has timestamp lower then the onboarding, we stop
      if (onboardingTimestamp > new Date(message.timestamp)) {
        hasMore = false;
        break;
      } else {
        // we know that messages arrives sort by timestamp desc, latest will always be the lowest
        before = message.id;
      }
      channelMessages.push(message);
      if (channelMessages.length >= 400) {
        const messagesChunk = channelMessages.splice(0, channelMessages.length);
        await processMessagesChunk({
          messagesChunk,
          channel,
        });
      }
    }
  }
  if (channelMessages.length) {
    await processMessagesChunk({
      messagesChunk: channelMessages,
      channel,
    });
  }
  return { cursor: after };
}

export async function processMessagesChunk({
  messagesChunk,
  channel,
}: {
  channel: channels;
  messagesChunk: DiscordMessage[];
}) {
  console.log('processMessagesChunk >> started', messagesChunk.length);
  for (const message of messagesChunk) {
    if (!filterKnownMessagesTypes(message)) {
      continue;
    }
    const usersInMessages = getUsersInMessages([message]);
    const users = await findUsers(channel.accountId!, usersInMessages);
    const messageParsed = parseMessage(channel, message, users, undefined);
    const threadParsed = await parseThreadFromMessage(messageParsed);
    const thread = await upsertThreadByExternalId(threadParsed);
    await upsertMessage({
      ...messageParsed,
      threadId: thread.id,
    });
  }
  console.log('processMessagesChunk >> finished');
}

async function parseThreadFromMessage(messageParsed: {
  authorId: string;
  body: string;
  channelId: string;
  sentAt: string;
  externalMessageId: string;
  threadId: string | undefined;
  mentions: { usersId: string }[] | undefined;
}) {
  return {
    sentAt: parseDiscordSentAt(messageParsed.sentAt),
    channelId: messageParsed.channelId,
    externalThreadId: messageParsed.externalMessageId,
    messageCount: 1,
    slug: createSlug(messageParsed.body),
    title: null,
    lastReplyAt: parseDiscordSentAt(messageParsed.sentAt),
  };
}

export async function createMessages({
  channel,
  thread,
  messages,
}: {
  channel: channels;
  thread?: threads;
  messages: DiscordMessage[];
}) {
  const usersInMessages = getUsersInMessages(messages);
  const users = await findUsers(channel.accountId!, usersInMessages);
  await Promise.all(
    messages.filter(filterKnownMessagesTypes).map((message) => {
      return upsertMessage(parseMessage(channel, message, users, thread?.id));
    })
  );
}

function filterKnownMessagesTypes(message: DiscordMessage) {
  return message.type === 0;
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

function parseMessage(
  channel: channels,
  message: DiscordMessage,
  users: users[],
  threadId?: string
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
    threadId,
    mentions,
  };
}
