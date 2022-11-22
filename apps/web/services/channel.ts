import { findAccountByPath } from '../lib/models';
import { GetServerSidePropsContext } from 'next/types';
import { NotFound } from '../utilities/response';
import { serialize as serializeSettings } from 'serializers/account/settings';
import { findThreadsByCursor, findPinnedThreads } from '../lib/threads';
import serializeAccount from '../serializers/account';
import serializeThread from '../serializers/thread';
import { ThreadsWithMessagesFull } from 'types/partialTypes';
import { decodeCursor, encodeCursor } from '../utilities/cursor';
import { SerializedChannel } from '@linen/types';
import {
  findChannelsByAccount,
  shouldThisChannelBeAnonymous,
} from '../lib/channel';
import { isBot } from 'next/dist/server/web/spec-extension/user-agent';
import PermissionsService from 'services/permissions';
import { RedirectTo } from 'utilities/response';
import {
  redirectChannelToDomain,
  resolveCrawlerRedirect,
  shouldRedirectToDomain,
} from 'utilities/redirects';

const CURSOR_LIMIT = 30;

export async function channelGetServerSideProps(
  context: GetServerSidePropsContext,
  isSubdomainbasedRouting: boolean
) {
  const permissions = await PermissionsService.for(context);
  if (!permissions.access) {
    return RedirectTo('/signin');
  }
  const isCrawler = isBot(context?.req?.headers?.['user-agent'] || '');
  const communityName = context.params?.communityName as string;
  const channelName = context.params?.channelName as string;
  const page = context.params?.page as string | undefined;

  const account = await findAccountByPath(communityName);
  if (!account) return NotFound();

  const channels = await findChannelsByAccount({
    isCrawler,
    account,
  });
  const channel = findChannelOrDefault(channels, channelName);
  if (!channel) return NotFound();

  const settings = serializeSettings(account);

  if (
    shouldRedirectToDomain({
      isCrawler,
      account,
      communityName,
      isSubdomainbasedRouting,
    })
  ) {
    return redirectChannelToDomain({
      account,
      communityName,
      settings,
      channelName,
      channel,
    });
  }

  if (isCrawler) {
    if (!channelName) {
      // should be redirect to default_channel
      return resolveCrawlerRedirect({
        isSubdomainbasedRouting,
        communityName,
        settings,
        channel,
      });
    }
    if (!!page) {
      // should be redirect to first page
      return resolveCrawlerRedirect({
        isSubdomainbasedRouting,
        communityName,
        settings,
        channel,
      });
    }
  }

  const { sort, direction, sentAt } = decodeCursor(undefined);

  const threads = (
    await findThreadsByCursor({
      channelIds: [channel.id],
      sentAt,
      sort,
      direction,
      anonymizeUsers: account.anonymizeUsers,
    })
  ).sort(sortBySentAtAsc);

  const pinnedThreads = await findPinnedThreads({
    channelIds: [channel.id],
    anonymizeUsers: account.anonymizeUsers,
    limit: 10,
  });

  const nextCursor = await buildCursor({
    sort,
    direction,
    sentAt,
    threads,
    pathCursor: page,
  });

  return {
    props: {
      nextCursor,
      currentChannel: channel,
      currentCommunity: serializeAccount(account),
      channelName: channel.channelName,
      channels,
      threads: threads.map(serializeThread),
      pinnedThreads: pinnedThreads.map(serializeThread),
      settings,
      isSubDomainRouting: isSubdomainbasedRouting,
      pathCursor: page || null,
      isBot: isCrawler,
      permissions,
    },
  };
}

function findChannelOrDefault(
  channels: SerializedChannel[],
  channelName: string
) {
  if (channelName) {
    return channels.find((c) => c.channelName === channelName);
  }
  const defaultChannel = channels.find((c) => c.default);
  if (defaultChannel) return defaultChannel;

  return channels[0];
}

// aka loadMore, it could be asc (gt) or desc (lt)
// it should return just one cursor, the one to keep loading into same direction
export async function channelNextPage(channelId: string, cursor: string) {
  const { sort, direction, sentAt } = decodeCursor(cursor);
  const anonymizeUsers = await shouldThisChannelBeAnonymous(channelId);
  const threads = await findThreadsByCursor({
    channelIds: [channelId],
    sentAt,
    sort,
    direction,
    anonymizeUsers,
  }).then((t) => t.sort(sortBySentAtAsc));

  const nextCursor = await buildCursor({
    threads,
    sort,
    sentAt,
    direction,
    loadMore: true,
  });

  return {
    threads: threads.map(serializeThread),
    nextCursor,
  };
}

function sortBySentAtAsc(
  a: ThreadsWithMessagesFull,
  b: ThreadsWithMessagesFull
) {
  return Number(a.sentAt) - Number(b.sentAt);
}

// TODO: Add unit test to this function
async function buildCursor({
  pathCursor,
  threads,
  sort,
  sentAt,
  direction,
  loadMore = false,
}: {
  pathCursor?: string;
  threads: ThreadsWithMessagesFull[];
  sort: string;
  sentAt?: string;
  direction: string;
  loadMore?: boolean;
}): Promise<{
  next: string | null;
  prev: string | null;
}> {
  const hasMore = threads?.length === CURSOR_LIMIT;

  // if empty, there is no cursor to return
  if (!threads?.length) return { prev: null, next: null };

  // load more
  if (loadMore) {
    if (sort === 'desc') {
      return { prev: encodeCursor(`desc:lt:${threads[0].sentAt}`), next: null };
    } else {
      return {
        prev: null,
        next: encodeCursor(`asc:gt:${threads[threads.length - 1].sentAt}`),
      };
    }
  }

  // first page
  if (sort === 'asc' && sentAt === '0') {
    return {
      prev: null,
      next: hasMore
        ? encodeCursor(`asc:gt:${threads[threads.length - 1].sentAt}`)
        : null,
    };
  }

  // back to channel
  if (sort === 'asc' && direction === 'gte') {
    return {
      prev: encodeCursor(`desc:lt:${threads[0].sentAt}`),
      next: hasMore
        ? encodeCursor(`asc:gt:${threads[threads.length - 1].sentAt}`)
        : null,
    };
  }
  // N page
  if (!!pathCursor) {
    return {
      prev: encodeCursor(`desc:lt:${threads[0].sentAt}`),
      next: hasMore
        ? encodeCursor(`asc:gt:${threads[threads.length - 1].sentAt}`)
        : null,
    };
  }
  // empty, last page
  return {
    prev: encodeCursor(`desc:lt:${threads[0].sentAt}`),
    next: null,
  };
}
