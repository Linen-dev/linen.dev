import prisma from '../../client';
import { channels } from '@prisma/client';
import { processNewThreads } from './threads';
import {
  discordChannel,
  DiscordMessage,
} from '../../types/discordResponses/discordMessagesInterface';
import { getDiscordWithRetry } from './api';
import { CrawlType, LIMIT } from './constrains';
import { findOrCreateChannel } from '../../lib/models';

async function updateCursor(channel: channels, cursor?: string | null) {
  if (cursor) {
    await prisma.channels.update({
      data: { externalPageCursor: cursor },
      where: { id: channel.id },
    });
  }
}

async function getDiscordChannels(
  serverId: string,
  token: string
): Promise<discordChannel[]> {
  const result = await getDiscordWithRetry({
    path: `/guilds/${serverId}/channels`,
  });
  return result.filter((c: discordChannel) => {
    // type	0	:: a text channel within a server
    return c.type === 0;
  });
}

async function crawlChannel(
  channel: channels,
  onboardingTimestamp: Date,
  crawlType: CrawlType
): Promise<{
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
    const messages: DiscordMessage[] = await getDiscordWithRetry({
      path: `/channels/${channel.externalChannelId}/messages`,
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
      channelMessages.push(message);
      if (channelMessages.length >= 400) {
        const newThreads = channelMessages.splice(0, channelMessages.length);
        await processNewThreads(
          newThreads,
          channel,
          crawlType,
          onboardingTimestamp
        );
      }
    }
  }
  if (channelMessages.length) {
    await processNewThreads(
      channelMessages,
      channel,
      crawlType,
      onboardingTimestamp
    );
  }
  return { cursor: after };
}

export async function processChannel(
  channel: channels,
  onboardingTimestamp: Date,
  crawlType: CrawlType
) {
  const { cursor } = await crawlChannel(
    channel,
    onboardingTimestamp,
    crawlType
  );

  // if everything is fine, persist cursor
  if (cursor) {
    await updateCursor(channel, cursor);
  }
}

export async function listChannelsAndPersist({
  serverId,
  accountId,
  token,
}: {
  serverId: string;
  accountId: string;
  token: string;
}) {
  const channels = await getDiscordChannels(serverId, token);
  const channelPromises = Promise.all(
    channels.map((channel: discordChannel) => {
      return findOrCreateChannel({
        externalChannelId: channel.id,
        channelName: channel.name,
        accountId,
        hidden: isPrivate(channel),
      });
    })
  );
  return await channelPromises;
}
function isPrivate(channel: discordChannel): boolean {
  if (channel.nsfw) {
    return true;
  }
  // we assume that if there any permission it is a private channel
  // customer should toggle it on settings page if want to make it public
  if (channel.permission_overwrites && channel.permission_overwrites.length) {
    return true;
  }
  return false;
}
