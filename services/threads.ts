import serializeThread from '../serializers/thread';
import {
  threadIndex,
  threadCount,
  channelIndex,
  findAccountById,
  findThreadById,
  channelsGroupByThreadCount,
} from '../lib/models';
import { ThreadByIdResponse } from '../types/apiResponses/threads/[threadId]';
import { accounts, users } from '@prisma/client';
import { buildSettings } from './accountSettings';

interface IndexProps {
  channelId: string;
  page: number;
  account: accounts;
}

export async function index({ channelId, page, account }: IndexProps) {
  const take = 10;
  const skip = (page - 1) * take;
  const [threads, total] = await Promise.all([
    threadIndex({ channelId, take, skip, account }),
    threadCount(channelId),
  ]);
  return {
    data: {
      threads: threads.map(serializeThread),
    },
    pagination: {
      totalCount: total,
      pageCount: Math.ceil(total / take),
      currentPage: page,
      perPage: take,
    },
  };
}

// extracted here to be reused in both /[threadId]/index and /[slug]/index
export async function getThreadById(
  threadId: string
): Promise<ThreadByIdResponse> {
  const id = parseInt(threadId);
  const thread = await findThreadById(id);

  if (!thread || !thread?.channel?.accountId) {
    return Promise.reject(new Error('Thread not found'));
  }

  const [channels, account, channelsResponse] = await Promise.all([
    channelIndex(thread.channel.accountId),
    findAccountById(thread.channel.accountId),
    channelsGroupByThreadCount(thread?.channel?.accountId),
  ]);

  //Filter out channels with less than 20 threads
  const channelsWithMinThreads = channels
    .filter((c) => !c.hidden)
    .filter((c) => {
      if (c.id === thread?.channel?.id) {
        return true;
      }

      const channelCount = channelsResponse.find((r) => {
        return r.channelId === c.id;
      });

      return channelCount && channelCount.count > 2;
    });

  if (!account) {
    return Promise.reject(new Error('Account not found'));
  }

  const settings = buildSettings(account);

  const authors = thread.messages
    .map((m) => m.author)
    .filter(Boolean) as users[];

  let threadUrl: string;

  if (account.slackInviteUrl) {
    if (account.slackInviteUrl.includes('slack.com/join/shared_invite')) {
      threadUrl =
        account.slackInviteUrl &&
        `${account.slackInviteUrl}/archives/${
          thread.channel.slackChannelId
        }/p${(parseFloat(thread.slackThreadTs) * 1000000).toString()}`;
    } else {
      threadUrl = account.slackInviteUrl;
    }
  } else {
    threadUrl =
      account.slackUrl +
      '/archives/' +
      thread.channel.slackChannelId +
      '/p' +
      (parseFloat(thread.slackThreadTs) * 1000000).toString();
  }

  if (account.discordServerId) {
    threadUrl = `https://discord.com/channels/${account.discordServerId}/${thread.channel.slackChannelId}/${thread.slackThreadTs}`;
  }

  return {
    id: thread.id,
    incrementId: thread.incrementId,
    viewCount: thread.viewCount,
    slug: thread.slug || '',
    slackThreadTs: thread.slackThreadTs,
    messageCount: thread.messageCount,
    channelId: thread.channel.id,
    channel: thread.channel,
    authors: authors,
    messages: serializeThread(thread).messages,
    threadId,
    currentChannel: thread.channel,
    channels: channelsWithMinThreads,
    slackUrl: account.slackUrl || '',
    slackInviteUrl: account.slackInviteUrl || '',
    communityName:
      account.slackDomain ||
      account.discordDomain ||
      account.discordServerId ||
      '',
    threadUrl,
    settings,
  };
}
