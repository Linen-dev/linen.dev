import serializeThread from 'serializers/thread';
import { findAccountByPath } from 'lib/models';
import CommunitiesService from 'services/communities';
import { findThreadByIncrementId } from 'lib/threads';
import { channels, threads, users, prisma } from '@linen/database';
import { GetServerSidePropsContext } from 'next';
import { NotFound } from 'utilities/response';
import serializeAccount from 'serializers/account';
import { serialize as serializeSettings } from 'serializers/account/settings';
import { encodeCursor } from 'utilities/cursor';
import PermissionsService from 'services/permissions';
import { RedirectTo } from 'utilities/response';
import { findChannelsByAccount } from 'lib/channel';
import { isBot } from 'next/dist/server/web/spec-extension/user-agent';
import {
  redirectThreadToDomain,
  shouldRedirectToDomain,
} from 'utilities/redirects';
import { qs } from '@linen/utilities/url';
import { SerializedAccount } from '@linen/types';

export async function threadGetServerSideProps(
  context: GetServerSidePropsContext,
  isSubdomainbasedRouting: boolean
) {
  const permissions = await PermissionsService.for(context);
  if (!permissions.access) {
    return RedirectTo(
      `/signin?${qs({
        ...(permissions.auth?.id && { error: 'private' }),
        callbackUrl: context.req.url,
      })}`
    );
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
    const currentCommunity = serializeAccount(account);

    const isCrawler = isBot(context?.req?.headers?.['user-agent'] || '');

    if (
      isCrawler &&
      shouldRedirectToDomain({
        account: currentCommunity,
        communityName,
        isSubdomainbasedRouting,
      })
    ) {
      return redirectThreadToDomain({
        account: currentCommunity,
        communityName,
        settings,
        threadId,
        slug,
      });
    }

    const promisePrevNext = isCrawler
      ? getPrevNextFromThread(thread)
      : Promise.resolve(null);

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
    const communities = await CommunitiesService.find(context.req, context.res);

    return {
      props: {
        thread: serializeThread(thread),
        externalThreadId: thread.externalThreadId,
        channelId: currentChannel.id,
        currentCommunity,
        channel: currentChannel,
        communities: communities.map(serializeAccount) as SerializedAccount[],
        authors: authors,
        currentChannel,
        channels,
        threadUrl,
        settings,
        pathCursor: encodeCursor(`asc:gte:${thread.sentAt.toString()}`),
        permissions,
        isBot: isCrawler,
        isSubDomainRouting: isSubdomainbasedRouting,
        pagination: await promisePrevNext,
      },
    };
  } catch (exception) {
    console.error(exception);
    return NotFound();
  }
}

async function getPrevNextFromThread(
  thread: threads & {
    channel?: channels | undefined;
  }
) {
  const promisePrev = prisma.threads.findFirst({
    select: { incrementId: true, slug: true },
    where: { sentAt: { lt: thread.sentAt }, channelId: thread.channel?.id },
    take: 1,
    orderBy: { sentAt: 'desc' },
  });
  const promiseNext = prisma.threads.findFirst({
    select: { incrementId: true, slug: true },
    where: { sentAt: { gt: thread.sentAt }, channelId: thread.channel?.id },
    take: 1,
    orderBy: { sentAt: 'asc' },
  });
  return {
    prev: await promisePrev,
    next: await promiseNext,
  };
}
