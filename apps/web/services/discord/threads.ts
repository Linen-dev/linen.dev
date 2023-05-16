import { channels, threads } from '@linen/database';
import {
  DiscordArchivedPublicThreads,
  DiscordMessage,
  DiscordThread,
} from '@linen/types';
import DiscordApi from './api';
import { LIMIT } from './constrains';
import { createMessages } from './messages';
import { slugify } from '@linen/utilities/string';
import { parseDiscordSentAt } from '@linen/serializers/sentAt';
import to from '@linen/utilities/await-to-js';
import { findOrCreateThread, updateLastReplyAt } from 'services/threads';
import ChannelsService from 'services/channels';
import Logger from './logger';

export async function getActiveThreads({
  serverId,
  token,
  onboardingTimestamp,
  logger,
}: {
  serverId: string;
  token: string;
  onboardingTimestamp: Date;
  logger: Logger;
}) {
  logger.log('getActiveThreads >> started');

  const [err, response] = await to(
    DiscordApi.getActiveThreads({
      serverId,
      token,
    })
  );
  if (err) {
    logger.error(`getActiveThreads >> finished with failure: ${err}`);
    return;
  }

  logger.log(`threads found: ${response.threads.length}`);
  for (const thread of response.threads) {
    if (!thread.parent_id) {
      logger.error(`thread without channel: ${JSON.stringify(thread)}`);
      continue;
    }
    if (
      thread.thread_metadata?.create_timestamp &&
      onboardingTimestamp > new Date(thread.thread_metadata.create_timestamp)
    ) {
      continue;
    }
    const channel = await ChannelsService.findByExternalId(thread.parent_id);
    if (!channel) {
      logger.error(`channel not found on linen db: ${JSON.stringify(thread)}`);
      continue;
    }
    await processThread({
      thread,
      onboardingTimestamp,
      channel,
      token,
      logger,
    });
  }
  logger.log('getActiveThreads >> finished');
}

export async function getArchivedThreads({
  channel,
  token,
  onboardingTimestamp,
  logger,
}: {
  channel: channels;
  token: string;
  onboardingTimestamp: Date;
  logger: Logger;
}) {
  if (!channel.externalChannelId) {
    return;
  }
  logger.log('getArchivedThreads >> started');
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
      logger.error(`getArchivedThreads >> finished with failure: ${err}`);
      return;
    }
    const response = result as DiscordArchivedPublicThreads;

    has_more = response.has_more
      ? response.threads[response.threads.length - 1].thread_metadata
          ?.create_timestamp
      : null;

    for (const thread of response.threads) {
      if (
        thread.thread_metadata?.create_timestamp &&
        onboardingTimestamp > new Date(thread.thread_metadata.create_timestamp)
      ) {
        continue;
      }
      await processThread({
        thread,
        onboardingTimestamp,
        channel,
        token,
        logger,
      });
    }
  } while (has_more);
  logger.log('getArchivedThreads >> finished');
}

async function processThread({
  thread,
  onboardingTimestamp,
  channel,
  token,
  logger,
}: {
  thread: DiscordThread;
  onboardingTimestamp: Date;
  channel: channels;
  token: string;
  logger: Logger;
}) {
  let linenThread = await findOrCreateThread(parseThread(thread, channel));

  const messages = await crawlExistingThread({
    thread: linenThread,
    onboardingTimestamp,
    token,
    logger,
  });

  // persist thread with messages
  await upsertThreadWithNewMessages({
    channel,
    thread: linenThread,
    messages,
    logger,
  });
}

function parseThread(thread: DiscordThread, channel: channels) {
  const date = thread.thread_metadata?.create_timestamp || Date.now();
  return {
    channelId: channel.id,
    externalThreadId: thread.id,
    messageCount: (thread.message_count || 0) + 1,
    ...(thread.name && { slug: slugify(thread.name) }),
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
  logger,
}: {
  thread: threads;
  lastExternalMessageId?: string;
  onboardingTimestamp: Date;
  token: string;
  logger: Logger;
}) {
  const messagesInThread: DiscordMessage[] = [];

  const threadId = thread.externalThreadId;
  if (!threadId) {
    logger.error('crawlExistingThread finished: missing externalThreadId');
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
      logger.error(`crawlExistingThread failure: ${err}`);
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
  logger.log(
    `thread: ${thread.incrementId} with ${messagesInThread.length} messages found`
  );
  return messagesInThread;
}

async function upsertThreadWithNewMessages({
  channel,
  thread,
  messages,
  logger,
}: {
  channel: channels;
  thread: threads;
  messages: DiscordMessage[];
  logger: Logger;
}) {
  await createMessages({
    channel,
    thread,
    messages,
    logger,
  });

  try {
    if (messages.length) {
      const lastMessage = messages[messages.length - 1];
      const lastReplyAt = parseDiscordSentAt(lastMessage.timestamp);
      if (lastReplyAt && thread.id) {
        await updateLastReplyAt({ lastReplyAt, threadId: thread.id });
      }
    }
  } catch (error) {
    logger.error(JSON.stringify(error));
  }
}
