import serializeThread from '../serializers/thread';
import { links } from '../constants/examples';
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

// extracted here to be resused in both /[threadId]/index and /[slug]/index
export async function getThreadById(
  threadId: string
): Promise<ThreadByIdResponse> {
  const id = parseInt(threadId);
  const thread = await findThreadById(id);

  if (!thread || !thread.channel.accountId) {
    return {
      notFound: true,
    };
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
      if (c.id === thread.channel.id) {
        return true;
      }

      const channelCount = channelsResponse.find((r) => {
        return r.channelId === c.id;
      });

      return channelCount && channelCount._count.id > 0;
    });

  if (!account) {
    return {
      notFound: true,
    };
  }

  const defaultSettings =
    links.find(({ accountId }) => accountId === account.id) || links[0];

  const settings = {
    brandColor: account.brandColor || defaultSettings.brandColor,
    homeUrl: account.homeUrl || defaultSettings.homeUrl,
    docsUrl: account.docsUrl || defaultSettings.docsUrl,
    logoUrl: account.logoUrl || defaultSettings.logoUrl,
  };

  const authors = thread.messages
    .map((m) => m.author)
    .filter(Boolean) as users[];

  const threadUrl =
    account.slackUrl +
    '/archives/' +
    thread.channel.slackChannelId +
    '/p' +
    (parseFloat(thread.slackThreadTs) * 1000000).toString();

  const threadSlackInviteUrl =
    account.slackInviteUrl &&
    `${account.slackInviteUrl}/archives/${thread.channel.slackChannelId}/p${(
      parseFloat(thread.slackThreadTs) * 1000000
    ).toString()}`;

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
    communityName: account.slackDomain || '',
    threadUrl,
    settings,
  };
}
