import { channels, threads } from '@prisma/client';
import {
  DiscordArchivedPublicThreads,
  DiscordMessage,
  DiscordThread,
} from 'types/discord';
import DiscordApi from './api';
import { CrawlType, LIMIT } from './constrains';
import { createMessages } from './messages';
import { createSlug } from 'utilities/util';
import { parseDiscordSentAt } from 'utilities/sentAt';
import to from 'utilities/await-to-js';
import { findOrCreateThread, updateLastReplyAt } from 'lib/threads';
import ChannelsService from 'services/channels';

export async function getActiveThreads({
  serverId,
  token,
  crawlType,
  onboardingTimestamp,
}: {
  serverId: string;
  token: string;
  crawlType: CrawlType;
  onboardingTimestamp: Date;
}) {
  console.log('getActiveThreads >> started');

  const [err, response] = await to(
    DiscordApi.getActiveThreads({
      serverId,
      token,
    })
  );
  if (err) {
    console.log('getActiveThreads >> finished with failure: ', err);
    return;
  }

  console.log('threads', response.threads.length);
  for (const thread of response.threads) {
    if (!thread.parent_id) {
      console.warn('thread without channel: %j', thread);
      continue;
    }
    const channel = await ChannelsService.findByExternalId(thread.parent_id);
    if (!channel) {
      console.warn('channel not found on linen db: ', thread.parent_id);
      continue;
    }
    await processThread({
      crawlType,
      thread,
      onboardingTimestamp,
      channel,
      token,
    });
  }
  console.log('getActiveThreads >> finished');
}

export async function getArchivedThreads({
  channel,
  token,
  crawlType,
  onboardingTimestamp,
}: {
  channel: channels;
  token: string;
  crawlType: CrawlType;
  onboardingTimestamp: Date;
}) {
  if (!channel.externalChannelId) {
    return;
  }
  console.log('getArchivedThreads >> started');
  let has_more;
  do {
    const [err, result] = await to(
      DiscordApi.getArchivedPublicThreads({
        externalChannelId: channel.externalChannelId,
        limit: LIMIT,
        before: has_more,
        token,
      })
    );
    if (err) {
      console.log('getArchivedThreads >> finished with failure: ', err);
      return;
    }
    const response = result as DiscordArchivedPublicThreads;

    has_more = response.has_more
      ? response.threads[response.threads.length - 1].id
      : null;

    for (const thread of response.threads) {
      await processThread({
        crawlType,
        thread,
        onboardingTimestamp,
        channel,
        token,
      });
    }
  } while (has_more);
  console.log('getArchivedThreads >> finished');
}

async function processThread({
  crawlType,
  thread,
  onboardingTimestamp,
  channel,
  token,
}: {
  crawlType: CrawlType;
  thread: DiscordThread;
  onboardingTimestamp: Date;
  channel: channels;
  token: string;
}) {
  let linenThread = await findOrCreateThread(parseThread(thread, channel));

  let lastExternalMessageId: string | undefined;
  if ([CrawlType.historic, CrawlType.from_onboarding].includes(crawlType)) {
    // this will force sync all messages until reach onboardingTimestamp,
    lastExternalMessageId = undefined;
  } else {
    if (linenThread.messages.length) {
      lastExternalMessageId =
        linenThread.messages.sort(
          (a, b) => b.sentAt.getTime() - a.sentAt.getTime()
        )[0].externalMessageId || undefined;
    }
  }

  const messages = await crawlExistingThread({
    thread: linenThread,
    onboardingTimestamp,
    token,
    lastExternalMessageId,
  });

  // persist thread with messages
  await upsertThreadWithNewMessages({
    channel,
    thread: linenThread,
    messages,
  });
}

function parseThread(thread: DiscordThread, channel: channels) {
  const date = thread.thread_metadata?.create_timestamp || Date.now();
  return {
    channelId: channel.id,
    externalThreadId: thread.id,
    messageCount: (thread.message_count || 0) + 1,
    ...(thread.name && { slug: createSlug(thread.name) }),
    title: thread.name,
    sentAt: new Date(date).getTime(),
    lastReplyAt: new Date(date).getTime(),
  };
}

async function crawlExistingThread({
  thread,
  onboardingTimestamp,
  token,
  lastExternalMessageId,
}: {
  thread: threads;
  lastExternalMessageId?: string;
  onboardingTimestamp: Date;
  token: string;
}) {
  const messagesInThread: DiscordMessage[] = [];

  const threadId = thread.externalThreadId;
  if (!threadId) {
    console.warn('crawlExistingThread finished: missing externalThreadId');
    return [];
  }

  let hasMore = true;
  // before will have the last messageId from request to be used on next pagination request
  let before;
  // cursor/after should be the first messageId receive from the last run
  let after = lastExternalMessageId;
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
        externalId: threadId,
        query,
        token,
      })
    );
    if (err) {
      console.warn('crawlExistingThread failure:', err);
      return [];
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
      messagesInThread.push(message);
    }
  }
  console.log({
    thread: thread.incrementId,
    messages: messagesInThread.length,
  });
  return messagesInThread;
}

async function upsertThreadWithNewMessages({
  channel,
  thread,
  messages,
}: {
  channel: channels;
  thread: threads;
  messages: DiscordMessage[];
}) {
  await createMessages({
    channel,
    thread,
    messages,
  });

  try {
    const lastReplyAt = parseDiscordSentAt(
      messages[messages.length - 1].timestamp
    );
    if (lastReplyAt && thread.id) {
      await updateLastReplyAt({ lastReplyAt, threadId: thread.id });
    }
  } catch (error) {
    console.warn(error);
  }
}
