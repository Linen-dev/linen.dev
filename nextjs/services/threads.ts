import serializeThread from '../serializers/thread';
import {
  channelIndex,
  findAccountByPath,
  channelsGroupByThreadCount,
} from '../lib/models';
import { findThreadById } from '../lib/threads';
import { ThreadByIdProp } from '../types/apiResponses/threads/[threadId]';
import type { users } from '@prisma/client';
import { GetServerSidePropsContext } from 'next';
import { NotFound } from '../utilities/response';
import { serialize as serializeSettings } from 'serializers/account/settings';
import { captureException } from '@sentry/nextjs';
import { encodeCursor } from 'utilities/cursor';
import PermissionsService from 'services/permissions';
import { RedirectTo } from 'utilities/response';
import {
  redirectThreadToDomain,
  shouldRedirectToDomain,
} from 'utilities/redirects';

export async function threadGetServerSideProps(
  context: GetServerSidePropsContext,
  isSubdomainbasedRouting: boolean
): Promise<{
  props?: ThreadByIdProp;
  notFound?: boolean;
  redirect?: object;
}> {
  const permissions = await PermissionsService.for(context);
  if (!permissions.access) {
    return RedirectTo('/signin');
  }
  const threadId = context.params?.threadId as string;
  const communityName = context.params?.communityName as string;
  const slug = context.params?.slug as string | undefined;
  try {
    const id = parseInt(threadId);
    const [thread, account] = await Promise.all([
      findThreadById(id),
      findAccountByPath(communityName),
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

    const settings = serializeSettings(account);

    if (
      shouldRedirectToDomain({
        account,
        communityName,
        isSubdomainbasedRouting,
      })
    ) {
      return redirectThreadToDomain({
        account,
        communityName,
        settings,
        threadId,
        slug,
      });
    }

    const [channels, channelsResponse] = await Promise.all([
      channelIndex(thread.channel.accountId, { hidden: false }),
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

        return channelCount && channelCount._count.id > 2;
      });

    const authors = thread.messages
      .map((m) => m.author)
      .filter(Boolean) as users[];

    let threadUrl: string | null = null;

    if (thread.externalThreadId) {
      if (account.communityInviteUrl) {
        if (
          account.communityInviteUrl.includes('slack.com/join/shared_invite')
        ) {
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
    }

    if (account.discordServerId) {
      threadUrl = `https://discord.com/channels/${account.discordServerId}/${thread.channel.externalChannelId}/${thread.externalThreadId}`;
    }

    return {
      props: {
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
        state: thread.state,
        permissions,
        isSubDomainRouting: isSubdomainbasedRouting,
      },
    };
  } catch (exception) {
    captureException(exception);
    console.error(exception);
    return NotFound();
  }
}
