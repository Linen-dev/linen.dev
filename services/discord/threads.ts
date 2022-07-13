import prisma from '../../client';
import { channels, threads } from '@prisma/client';
import { DiscordMessage } from '../../types/discordResponses/discordMessagesInterface';
import { createSlug } from '../../lib/util';
import { getDiscordWithRetry } from './api';
import { CrawlType, LIMIT } from './constrains';
import { createMessages } from './messages';

async function crawlExistingThread(
  thread: threads & {
    messages: {
      slackMessageId: string;
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
  let after = thread.messages.shift()?.slackMessageId;
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

async function persistExistingThreadWithMessages(
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

async function getThreadsFromDB(channel: channels, take: number, skip: number) {
  return await prisma.threads.findMany({
    where: {
      channelId: channel.id,
      externalThreadId: { not: channel.externalChannelId },
    },
    include: {
      messages: {
        select: { slackMessageId: true },
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
    take,
    skip,
  });
}

function upsertThreadType18(channelId: string, thread: DiscordMessage) {
  return upsertThreadType0(channelId, thread);
}

function upsertThreadType0(channelId: string, thread: DiscordMessage) {
  const slackThread = {
    externalThreadId: thread.thread?.id || thread.id,
    slug: createSlug(
      thread.content ||
        thread.thread?.name ||
        thread.referenced_message?.content ||
        thread.timestamp
    ),
    messageCount: 1,
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

const upsertThread: Record<
  number,
  (channelId: string, thread: DiscordMessage) => Promise<threads>
> = {
  0: upsertThreadType0,
  18: upsertThreadType18,
};

async function createThread(channelId: string, thread: DiscordMessage) {
  // console.log('thread', thread);
  return upsertThread[thread.type](channelId, thread);
}

async function updateThread(channel: channels, thread: threads) {
  const message: DiscordMessage = await getDiscordWithRetry({
    path: `/channels/${channel.externalChannelId}/messages/${thread.externalThreadId}`,
  });
  try {
    return await upsertThread[message.type](channel.id, message);
  } catch (err) {
    console.error(String(err));
    return;
  }
}

export const supportedThreadType = []; // type 0 must have thread attribute to be a thread

export async function updateThreadMessageCount(slackThreadId: string) {
  const messageCount = await prisma.messages.count({
    where: { slackThreadId },
  });
  await prisma.threads.update({
    data: { messageCount },
    where: {
      id: slackThreadId,
    },
  });
}

export async function processThreads(
  channel: channels,
  onboardingTimestamp: Date,
  accountId: string,
  crawlType: CrawlType
) {
  let hasMore;
  let skip = 0;
  do {
    const threads = await getThreadsFromDB(channel, LIMIT, skip);
    console.log({ channel: channel.channelName, threads: threads.length });
    // for each thread
    for (const thread of threads) {
      // get new messages from thread
      if ([CrawlType.historic, CrawlType.from_onboarding].includes(crawlType)) {
        // this will force sync all messages until reach onboardingTimestamp,
        thread.messages = [];
      }
      const messages = await crawlExistingThread(thread, onboardingTimestamp);
      // persist thread with messages
      await persistExistingThreadWithMessages(
        accountId,
        channel,
        thread,
        messages
      );

      await updateThreadMessageCount(thread.id);
    }
    // pagination over our database
    hasMore = threads.length === LIMIT;
    skip += LIMIT;
  } while (hasMore);
}

export async function processNewThreads(
  newThreads: DiscordMessage[] | undefined,
  channel: channels
) {
  if (newThreads) {
    console.log({
      channel: channel.channelName,
      newThreads: newThreads.length,
    });
    for (const newThread of newThreads) {
      await createThread(channel.id, newThread);
    }
  }
}
