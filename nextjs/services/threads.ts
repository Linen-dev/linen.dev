import serializeThread from 'serializers/thread';
import { findAccountByPath } from '../lib/models';
import { findThreadByIncrementId } from '../lib/threads';
import { ThreadByIdProp } from '../types/apiResponses/threads/[threadId]';
import type { users } from '@prisma/client';
import { GetServerSidePropsContext } from 'next';
import { NotFound } from '../utilities/response';
import serializeAccount from 'serializers/account';
import { serialize as serializeSettings } from 'serializers/account/settings';
import { captureException } from '@sentry/nextjs';
import { encodeCursor } from 'utilities/cursor';
import PermissionsService from 'services/permissions';
import { RedirectTo } from 'utilities/response';
import { findChannelsByAccount } from 'lib/channel';
import { isBot } from 'next/dist/server/web/spec-extension/user-agent';
import {
  redirectThreadToDomain,
  shouldRedirectToDomain,
} from 'utilities/redirects';
import Session from 'services/session';
import serializeUser from 'serializers/user';

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
    if (!id) {
      throw new Error('Thread not found');
    }
    const [thread, account] = await Promise.all([
      findThreadByIncrementId(id),
      findAccountByPath(communityName),
    ]);

    if (!thread || !thread?.channel?.accountId) {
      throw new Error('Thread not found');
    }

    if (!account) {
      throw new Error('Account not found');
    }

    if (thread?.channel?.accountId !== account.id) {
      throw new Error('Thread not found');
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
    const isCrawler = isBot(context?.req?.headers?.['user-agent'] || '');

    const channels = await findChannelsByAccount({
      isCrawler,
      account,
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

    const currentChannel = channels.find((c) => c.id === thread.channel?.id)!;

    return {
      props: {
        thread: serializeThread(thread),
        externalThreadId: thread.externalThreadId,
        channelId: currentChannel.id,
        currentCommunity: serializeAccount(account),
        channel: currentChannel,
        authors: authors,
        currentChannel,
        channels,
        threadUrl,
        settings,
        pathCursor: encodeCursor(`asc:gte:${thread.sentAt.toString()}`),
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
