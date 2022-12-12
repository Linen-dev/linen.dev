import serializeThread from 'serializers/thread';
import { findAccountByPath } from '../lib/models';
import { findThreadByIncrementId } from '../lib/threads';
import { ThreadByIdProp } from '../types/apiResponses/threads/[threadId]';
import { channels, threads, users } from '@prisma/client';
import { Roles } from '@linen/types';
import { GetServerSidePropsContext } from 'next';
import { NotFound } from '../utilities/response';
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
import { prisma } from 'client';
import { qs } from 'utilities/url';

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
    const isCrawler = isBot(context?.req?.headers?.['user-agent'] || '');

    if (
      shouldRedirectToDomain({
        isCrawler,
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

export async function updateMetrics({
  messageId,
  threadId,
}: {
  messageId: string;
  threadId: string;
}) {
  const thread = await prisma.threads.findFirst({
    select: { firstManagerReplyAt: true, firstUserReplyAt: true },
    where: { id: threadId },
  });

  if (areRepliesAtFilled(thread)) {
    return Promise.resolve('nothing to update, already updated');
  } else {
    const [firstMessage, lastMessage] = await getFirstAndLastMessages(
      threadId,
      messageId
    );
    if (areAuthorSameAsReplier(firstMessage, lastMessage)) {
      return Promise.resolve('nothing to update, same author');
    }
    if (lastMessage && isReplierManager(thread, lastMessage)) {
      await updateThread(threadId, lastMessage, 'firstManagerReplyAt');
      return Promise.resolve('done, firstManagerReplyAt');
    }
    if (lastMessage && isReplierMember(thread, lastMessage)) {
      await updateThread(threadId, lastMessage, 'firstUserReplyAt');
      return Promise.resolve('done, firstUserReplyAt');
    }
  }
  return Promise.resolve('nothing to update');
}

async function updateThread(
  threadId: string,
  lastMessage: { sentAt: Date; author: users | null },
  field: 'firstManagerReplyAt' | 'firstUserReplyAt'
) {
  await prisma.threads.update({
    where: { id: threadId },
    data: { [field]: lastMessage.sentAt.getTime() },
  });
}

async function getFirstAndLastMessages(threadId: string, messageId: string) {
  return await Promise.all([
    prisma.messages.findFirst({
      where: { threads: { id: threadId } },
      take: 1,
      orderBy: { sentAt: 'asc' },
      select: { author: true },
    }),
    prisma.messages.findFirst({
      where: { id: messageId },
      select: { author: true, sentAt: true },
    }),
  ]);
}

function isReplierMember(
  thread: {
    firstManagerReplyAt: bigint | null;
    firstUserReplyAt: bigint | null;
  } | null,
  last: { sentAt: Date; author: users | null } | null
) {
  return (
    !thread?.firstUserReplyAt &&
    last?.author?.role &&
    last?.author?.role === Roles.MEMBER
  );
}

function isReplierManager(
  thread: {
    firstManagerReplyAt: bigint | null;
    firstUserReplyAt: bigint | null;
  } | null,
  last: { sentAt: Date; author: users | null } | null
) {
  return (
    !thread?.firstManagerReplyAt &&
    last?.author?.role &&
    (last?.author?.role === Roles.ADMIN || last?.author?.role === Roles.OWNER)
  );
}

function areAuthorSameAsReplier(
  first: { author: users | null } | null,
  last: { sentAt: Date; author: users | null } | null
) {
  return first?.author?.id === last?.author?.id;
}

function areRepliesAtFilled(
  thread: {
    firstManagerReplyAt: bigint | null;
    firstUserReplyAt: bigint | null;
  } | null
) {
  return thread?.firstManagerReplyAt && thread?.firstUserReplyAt;
}
