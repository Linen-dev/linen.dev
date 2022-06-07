import prisma from '../../client';
import { channels } from '@prisma/client';
import { processThreads, processNewThreads } from './threads';
import {
  discordChannel,
  DiscordMessage,
} from '../../types/discordResponses/discordMessagesInterface';
import { getDiscordWithRetry } from './api';
import { CrawlType, LIMIT } from './constrains';
import { createMessages } from './messages';
import { findOrCreateChannel } from '../../lib/models';

async function updateCursor(channel: channels, cursor?: string | null) {
  if (cursor) {
    await prisma.channels.update({
      data: { slackNextPageCursor: cursor },
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
  onboardingTimestamp: Date
): Promise<{
  newThreads?: DiscordMessage[];
  singleMessages?: DiscordMessage[];
  cursor?: string;
}> {
  const newThreads: DiscordMessage[] = [];
  const singleMessages: DiscordMessage[] = [];

  let hasMore = true;
  // before will have the last messageId from request to be used on next pagination request
  let before;
  // cursor/after should be the first messageId receive from the last run
  let after = channel.slackNextPageCursor || undefined;
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
      path: `/channels/${channel.slackChannelId}/messages`,
      query: { limit: LIMIT, ...query },
    });
    // if there is less than the limit, means that there is no more messages
    if (messages.length < LIMIT) {
      hasMore = false;
    }
    for (const message of messages) {
      // console.log(message);
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
      if (/** supportedThreadType.includes(message.type) || */ message.thread) {
        newThreads.push(message);
      } else {
        singleMessages.push(message);
      }
    }
  }
  return { newThreads, singleMessages, cursor: after };
}

async function persistMessagesIntoChannelThread(
  accountId: string,
  channel: channels,
  messages: DiscordMessage[]
) {
  if (messages.length) {
    let size = 10;
    for (let i = 0; i < messages.length; i += size) {
      // console.log('batch', i);
      await createMessages({
        accountId,
        channel,
        messages: messages.slice(i, i + size),
      });
    }
  }
}

export async function processChannel(
  channel: channels,
  onboardingTimestamp: Date,
  accountId: string,
  crawlType: CrawlType
) {
  const { newThreads, singleMessages, cursor } = await crawlChannel(
    channel,
    onboardingTimestamp
  );

  // persist singles
  if (singleMessages) {
    console.log({
      channel: channel.channelName,
      singles: singleMessages.length,
    });
    await persistMessagesIntoChannelThread(accountId, channel, singleMessages);
  }

  await processNewThreads(newThreads, channel);

  await processThreads(channel, onboardingTimestamp, accountId, crawlType);

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
        slackChannelId: channel.id,
        channelName: channel.name,
        accountId,
        hidden: isPrivate(channel),
      });
    })
  );
  return await channelPromises;
}
function isPrivate(channel: discordChannel): boolean {
  if (!channel.nsfw) {
    return true;
  }
  // we assume that if there any permission it is a private channel
  // customer should toggle it on settings page if want to make it public
  if (
    !channel.permission_overwrites ||
    channel.permission_overwrites?.length === 0
  ) {
    return true;
  }
  return false;
}
