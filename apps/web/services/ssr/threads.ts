import serializeThread from 'serializers/thread';
import { findThreadByIncrementId } from 'lib/threads';
import { channels, threads, prisma } from '@linen/database';
import { GetServerSidePropsContext } from 'next';
import { NotFound } from 'utilities/response';
import { RedirectTo } from 'utilities/response';
import { isBot } from 'next/dist/server/web/spec-extension/user-agent';
import {
  redirectThreadToDomain,
  shouldRedirectToDomain,
} from 'utilities/redirects';
import { SerializedAccount } from '@linen/types';
import { allowAccess, ssr } from 'services/ssr/common';

export async function threadGetServerSideProps(
  context: GetServerSidePropsContext,
  isSubdomainbasedRouting: boolean
) {
  try {
    const { props, notFound, ...rest } = await ssr(context, allowAccess);

    if (rest.redirect) {
      return RedirectTo(rest.location);
    }

    if (notFound || !props) {
      return NotFound();
    }

    const { channels, currentCommunity, dms, settings } = props;

    const threadId = context.params?.threadId as string;
    const communityName = context.params?.communityName as string;
    const slug = context.params?.slug as string | undefined;

    const id = parseInt(threadId);
    if (!id) {
      throw new Error('Thread not found');
    }

    const thread = await findThreadByIncrementId(id);

    if (!thread || !thread?.channel?.accountId) {
      throw new Error('Thread not found');
    }

    if (thread?.channel?.accountId !== currentCommunity.id) {
      throw new Error('Thread not found');
    }

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

    const threadUrl: string | null = getThreadUrl(thread, currentCommunity);

    const currentChannel = [...channels, ...dms].find(
      (c) => c.id === thread.channel?.id
    )!;

    return {
      props: {
        ...props,
        thread: serializeThread(thread),
        currentChannel,
        threadUrl,
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

function getThreadUrl(
  thread: threads & { channel?: channels },
  currentCommunity: SerializedAccount
) {
  let threadUrl: string | null = null;

  if (thread.externalThreadId) {
    if (currentCommunity.communityInviteUrl) {
      if (
        currentCommunity.communityInviteUrl.includes(
          'slack.com/join/shared_invite'
        )
      ) {
        threadUrl =
          currentCommunity.communityInviteUrl &&
          `${currentCommunity.communityInviteUrl}/archives/${
            thread?.channel?.externalChannelId
          }/p${(parseFloat(thread.externalThreadId) * 1000000).toString()}`;
      } else {
        threadUrl = currentCommunity.communityInviteUrl;
      }
    } else {
      threadUrl =
        currentCommunity.communityUrl +
        '/archives/' +
        thread?.channel?.externalChannelId +
        '/p' +
        (parseFloat(thread.externalThreadId) * 1000000).toString();
    }
  }

  if (currentCommunity.discordServerId) {
    threadUrl = `https://discord.com/channels/${currentCommunity.discordServerId}/${thread?.channel?.externalChannelId}/${thread.externalThreadId}`;
  }
  return threadUrl;
}
