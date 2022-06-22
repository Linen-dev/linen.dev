import serializeThread from '../serializers/thread';
import { buildSettings } from './accountSettings';
import {
  threadIndex,
  threadCount,
  channelIndex,
  findAccountById,
  findThreadById,
  channelsGroupByThreadCount,
} from '../lib/models';
import { ThreadByIdResponse } from '../types/apiResponses/threads/[threadId]';
import { users } from '@prisma/client';
import { anonymizeMessages } from '@/utilities/anonymizeMessages';

interface IndexProps {
  channelId: string;
  page: number;
}

export async function index({ channelId, page }: IndexProps) {
  const take = 10;
  const skip = (page - 1) * take;
  const [threads, total] = await Promise.all([
    threadIndex(channelId, take, skip),
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
export async function getThreadById(threadId: string) {
  console.time('getThreadById::' + threadId);
  const response = await _getThreadById(threadId);
  console.timeEnd('getThreadById::' + threadId);
  return response;
}
// extracted here to be resused in both /[threadId]/index and /[slug]/index
export async function _getThreadById(
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
    channelsGroupByThreadCount(),
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

      return channelCount && channelCount._count.id > 2;
    });

  if (!account) {
    return Promise.reject(new Error('Account not found'));
  }

  if (account?.anonymizeUsers) {
    const anonymousThread = anonymizeMessages({ ...thread });
    anonymousThread?.messages && (thread.messages = anonymousThread?.messages);
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
