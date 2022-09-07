import serializeThread from '../serializers/thread';
import {
  channelIndex,
  findAccountByPath,
  channelsGroupByThreadCount,
} from '../lib/models';
import { findThreadById } from '../lib/threads';
import {
  ThreadById,
  ThreadByIdProp,
} from '../types/apiResponses/threads/[threadId]';
import type { users } from '@prisma/client';
import { GetServerSidePropsContext } from 'next';
import { NotFound } from '../utilities/response';
import { buildSettings } from './accountSettings';
import { memoize } from '../utilities/dynamoCache';
import { captureExceptionAndFlush } from 'utilities/sentry';
import { encodeCursor } from 'utilities/cursor';
import PermissionsService from 'services/permissions';
import { RedirectTo } from 'utilities/response';

async function getThreadById(
  threadId: string,
  communityName: string
): Promise<ThreadById> {
  const id = parseInt(threadId);
  const [thread, account] = await Promise.all([
    findThreadByIdMemo(id),
    findAccountByPathMemo(communityName),
  ]);

  if (!thread || !thread?.channel?.accountId) {
    return Promise.reject(new Error('Thread not found'));
  }

  if (!account) {
    return Promise.reject(new Error('Account not found'));
  }

  if (thread?.channel?.accountId !== account.id) {
    console.log('thread belongs to another community');
    return Promise.reject(new Error('Thread not found'));
  }

  const [channels, channelsResponse] = await Promise.all([
    channelIndexMemo(thread.channel.accountId, { hidden: false }),
    channelsGroupByThreadCountMemo(thread?.channel?.accountId),
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

  const settings = buildSettings(account);

  const authors = thread.messages
    .map((m) => m.author)
    .filter(Boolean) as users[];

  let threadUrl: string;

  if (account.communityInviteUrl) {
    if (account.communityInviteUrl.includes('slack.com/join/shared_invite')) {
      threadUrl =
        account.communityInviteUrl &&
        `${account.communityInviteUrl}/archives/${
          thread.channel.externalChannelId
        }/p${(parseFloat(thread.externalThreadId) * 1000000).toString()}`;
    } else {
      threadUrl = account.communityInviteUrl;
    }
  } else {
    threadUrl =
      account.communityUrl +
      '/archives/' +
      thread.channel.externalChannelId +
      '/p' +
      (parseFloat(thread.externalThreadId) * 1000000).toString();
  }

  if (account.discordServerId) {
    threadUrl = `https://discord.com/channels/${account.discordServerId}/${thread.channel.externalChannelId}/${thread.externalThreadId}`;
  }

  return {
    id: thread.id,
    incrementId: thread.incrementId,
    viewCount: thread.viewCount,
    slug: thread.slug || '',
    externalThreadId: thread.externalThreadId,
    messageCount: thread.messageCount,
    channelId: thread.channel.id,
    channel: thread.channel,
    authors: authors,
    messages: serializeThread(thread).messages,
    threadId,
    currentChannel: thread.channel,
    channels: channelsWithMinThreads,
    threadUrl,
    settings,
    pathCursor: encodeCursor(`asc:gte:${thread.sentAt.toString()}`),
    title: thread.title,
  };
}

export async function threadGetServerSideProps(
  context: GetServerSidePropsContext,
  isSubdomainbasedRouting: boolean
): Promise<{
  props?: ThreadByIdProp;
  notFound?: boolean;
  redirect?: object;
}> {
  const access = await PermissionsService.access(context);
  if (!access) {
    return RedirectTo('/signin');
  }
  const threadId = context.params?.threadId as string;
  const communityName = context.params?.communityName as string;
  try {
    const thread = await getThreadByIdMemo(threadId, communityName);
    return {
      props: {
        ...thread,
        isSubDomainRouting: isSubdomainbasedRouting,
      },
    };
  } catch (exception) {
    await captureExceptionAndFlush(exception);
    console.error(exception);
    return NotFound();
  }
}

const findThreadByIdMemo = memoize(findThreadById);
const channelIndexMemo = memoize(channelIndex);
const findAccountByPathMemo = memoize(findAccountByPath);
const channelsGroupByThreadCountMemo = memoize(channelsGroupByThreadCount);
const getThreadByIdMemo = memoize(getThreadById);
