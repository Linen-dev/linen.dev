import prisma from '../../client';
import type { channels, threads } from '@prisma/client';
import { DiscordMessage } from '../../types/discordResponses/discordMessagesInterface';
import { createSlug } from '../../utilities/util';
import { getDiscordWithRetry } from './api';
import { CrawlType, LIMIT } from './constrains';
import { createMessages, filterKnownMessagesTypes } from './messages';
import { parseDiscordSentAt } from '../../utilities/sentAt';
import { captureException, flush } from '@sentry/nextjs';

async function crawlExistingThread(
  thread: threads & {
    messages?: {
      externalMessageId: string;
    }[];
  },
  onboardingTimestamp: Date
) {
  const messagesInThread: DiscordMessage[] = [];

  const threadId = thread.externalThreadId;

  let hasMore = true;
  // before will have the last messageId from request to be used on next pagination request
  let before;
  // cursor/after should be the first messageId receive from the last run
  let after = thread.messages?.shift()?.externalMessageId;
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
    const messages: DiscordMessage[] = await getDiscordWithRetry({
      path: `/channels/${threadId}/messages`,
      query: { limit: LIMIT, ...query },
    });
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
      messagesInThread.push(message);
    }
  }
  console.log({
    thread: thread.incrementId,
    messages: messagesInThread.length,
  });
  return messagesInThread;
}

async function upsertThreadWithNewMessages(
  accountId: string,
  channel: channels,
  thread: threads,
  messages: DiscordMessage[]
) {
  const persistedThread = await updateThread(channel, thread);
  await createMessages({
    accountId,
    channel,
    thread: persistedThread,
    messages,
  });
}

function upsertThread(channelId: string, thread: DiscordMessage) {
  const slackThread = {
    externalThreadId: thread.id,
    slug: createSlug(
      thread.content ||
        thread.thread?.name ||
        thread.referenced_message?.content ||
        thread.timestamp
    ),
    messageCount: (thread.thread?.message_count || 0) + 1,
    sentAt: parseDiscordSentAt(thread.timestamp),
    lastReplyAt: parseDiscordSentAt(thread.timestamp),
  };
  return prisma.threads.upsert({
    create: {
      ...slackThread,
      channelId,
    },
    update: {
      ...slackThread,
    },
    where: {
      externalThreadId: slackThread.externalThreadId,
    },
  });
}

async function updateThread(channel: channels, thread: threads) {
  const message: DiscordMessage = await getDiscordWithRetry({
    path: `/channels/${channel.externalChannelId}/messages/${thread.externalThreadId}`,
  });
  try {
    return await upsertThread(channel.id, message);
  } catch (err) {
    captureException(err);
    await flush(2000);
    console.error(String(err));
    return;
  }
}

export async function updateThreadMessageCount(threadId: string) {
  const messageCount = await prisma.messages.count({
    where: { threadId },
  });
  await prisma.threads.update({
    data: { messageCount },
    where: {
      id: threadId,
    },
  });
}

async function processThread(
  crawlType: CrawlType,
  thread: threads & { messages?: { externalMessageId: string }[] },
  onboardingTimestamp: Date,
  accountId: string,
  channel: channels
) {
  if ([CrawlType.historic, CrawlType.from_onboarding].includes(crawlType)) {
    // this will force sync all messages until reach onboardingTimestamp,
    thread.messages = [];
  }
  const messages = await crawlExistingThread(thread, onboardingTimestamp);
  // persist thread with messages
  await upsertThreadWithNewMessages(accountId, channel, thread, messages);

  await updateThreadMessageCount(thread.id);
}

export async function processNewThreads(
  newThreads: DiscordMessage[] | undefined,
  channel: channels,
  crawlType: CrawlType,
  onboardingTimestamp: Date
) {
  if (newThreads) {
    console.log({
      channel: channel.channelName,
      newThreads: newThreads.length,
    });
    for (const newThread of newThreads) {
      if (filterKnownMessagesTypes(newThread)) {
        const thread = await upsertThread(channel.id, newThread);
        await createMessages({
          accountId: channel.accountId as string,
          channel,
          messages: [newThread],
          thread,
        });
        // if thread found, we crawl for messages
        if (newThread.thread?.id === newThread.id) {
          await processThread(
            crawlType,
            thread,
            onboardingTimestamp,
            channel.accountId as string,
            channel
          );
        }
      }
    }
  }
}
