import serializeThread from '../serializers/thread';
import { findAccountByPath } from '../lib/models';
import { findThreadByIncrementId } from '../lib/threads';
import { ThreadByIdProp } from '../types/apiResponses/threads/[threadId]';
import type { users } from '@prisma/client';
import { GetServerSidePropsContext } from 'next';
import { NotFound } from '../utilities/response';
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
import { findAuthByEmail } from 'lib/users';
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
    const [thread, account] = await Promise.all([
      findThreadByIncrementId(id),
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

    let currentUser;
    const session = await Session.find(context.req, context.res);
    if (session && session.user && session.user.email) {
      const auth = await findAuthByEmail(session.user.email);
      if (auth) {
        currentUser = auth.users.find((u) => u.accountsId === auth.accountId);
      }
    }

    return {
      props: {
        id: thread.id,
        incrementId: thread.incrementId,
        viewCount: thread.viewCount,
        slug: thread.slug || '',
        externalThreadId: thread.externalThreadId,
        messageCount: thread.messageCount,
        channelId: currentChannel.id,
        currentUser: currentUser && serializeUser(currentUser),
        channel: currentChannel,
        authors: authors,
        messages: serializeThread(thread).messages,
        threadId,
        currentChannel,
        channels,
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
