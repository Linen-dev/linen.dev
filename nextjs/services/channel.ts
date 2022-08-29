import { findAccountByPath } from '../lib/models';
import { GetServerSidePropsContext } from 'next/types';
import { NotFound } from '../utilities/response';
import { buildSettings, Settings } from './accountSettings';
import { memoize } from '../utilities/dynamoCache';
import { findPreviousCursor, findThreadsByCursor } from '../lib/threads';
import serializeThread from '../serializers/thread';
import {
  AccountWithSlackAuthAndChannels,
  ThreadsWithMessagesFull,
} from 'types/partialTypes';
import type { channels } from '@prisma/client';
import { decodeCursor, encodeCursor } from '../utilities/cursor';
import { shouldThisChannelBeAnonymous } from '../lib/channel';
import {
  findAccountsFreeDiscordWithMessages,
  findAccountsFreeSlackWithMessages,
  findAccountsPremiumWithMessages,
} from 'lib/account';
import {
  ChannelViewCursorProps,
  ChannelResponse,
} from 'components/Pages/ChannelsPage';
import { isBot } from 'next/dist/server/web/spec-extension/user-agent';

const CURSOR_LIMIT = 10;

export async function channelGetServerSideProps(
  context: GetServerSidePropsContext,
  isSubdomainbasedRouting: boolean
): Promise<ChannelResponse> {
  const communityName = context.params?.communityName as string;
  const channelName = context.params?.channelName as string;
  const page = context.params?.page as string | undefined;
  const cursor = page && parsePageParam(page);

  const account = (await findAccountByPathMemo(communityName, {
    include: { channels: { where: { hidden: false } } },
  })) as AccountWithSlackAuthAndChannels;
  if (!account) return NotFound();

  const channel = findChannelOrDefault(account.channels, channelName);
  if (!channel) return NotFound();

  const settings = buildSettings(account);

  const isCrawler = isBot(context?.req?.headers?.['user-agent'] || '');

  if (isCrawler) {
    if (!channelName) {
      // should be redirect to <default_channel>/<first_page>
      return resolveRedirect({
        isSubdomainbasedRouting,
        communityName,
        settings,
        channel,
      });
    }
    if (!page) {
      // should be redirect to first page
      return resolveRedirect({
        isSubdomainbasedRouting,
        communityName,
        settings,
        channel,
      });
    }
  }

  const { sort, direction, sentAt } = decodeCursor(cursor);

  const threads = (
    await findThreadsByCursorMemo({
      channelIds: [channel.id],
      sentAt,
      sort,
      direction,
      anonymizeUsers: account.anonymizeUsers,
    })
  ).sort(sortBySentAtAsc);

  const nextCursor = await buildCursor({
    sort,
    direction,
    sentAt,
    threads,
    pathCursor: page,
    channelIds: [channel.id],
    isCrawler,
  });

  return {
    props: {
      nextCursor,
      currentChannel: channel,
      channelName: channel.channelName,
      channels: account.channels,
      threads: threads.map(serializeThread),
      settings,
      isSubDomainRouting: isSubdomainbasedRouting,
      pathCursor: page || null,
      isBot: isCrawler,
    },
  };
}

function findChannelOrDefault(channels: channels[], channelName: string) {
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
  const anonymizeUsers = await shouldThisChannelBeAnonymousMemo(channelId);
  const threads = await findThreadsByCursorMemo({
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
    channelIds: [],
    loadMore: true,
  });

  return {
    threads: threads.map(serializeThread),
    nextCursor,
  };
}

const shouldThisChannelBeAnonymousMemo = memoize(shouldThisChannelBeAnonymous);
const findThreadsByCursorMemo = memoize(findThreadsByCursor);
const findAccountByPathMemo = memoize(findAccountByPath);

function parsePageParam(page: string) {
  // if is a number we should return undefined
  if (/^\d+$/.exec(page)) {
    return undefined;
  } else {
    return page;
  }
}

function sortBySentAtAsc(
  a: ThreadsWithMessagesFull,
  b: ThreadsWithMessagesFull
) {
  return Number(a.sentAt) - Number(b.sentAt);
}

// TODO: clean up
async function getPathsFromPrefix(pathPrefix: string) {
  if (pathPrefix === '/subdomain') {
    const accounts = await findAccountsPremiumWithMessages();
    return accounts.map((account) => account.redirectDomain).filter(Boolean);
  }
  if (pathPrefix === '/d') {
    const accounts = await findAccountsFreeDiscordWithMessages();
    return accounts
      .map((account) => account.discordDomain || account.discordServerId)
      .filter(Boolean);
  }
  if (pathPrefix === '/s') {
    const accounts = await findAccountsFreeSlackWithMessages();
    return accounts
      .map((account) => account.slackDomain || account.slackTeamId)
      .filter(Boolean);
  }
  return [];
}

// TODO: Add unit test to this function
async function buildCursor({
  pathCursor,
  threads,
  sort,
  sentAt,
  direction,
  channelIds,
  loadMore = false,
  isCrawler = false,
}: {
  pathCursor?: string;
  threads: ThreadsWithMessagesFull[];
  sort: string;
  sentAt?: string;
  direction: string;
  channelIds: string[];
  loadMore?: boolean;
  isCrawler?: boolean;
}): Promise<ChannelViewCursorProps> {
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

  // if isCrawler we should have the prev cursor as same as the sitemap does
  if (isCrawler) {
    // prev: we need to query our db to get the previous page
    const previousPage = await findPreviousCursor({
      channelIds,
      direction: 'lt',
      sort: 'desc',
      sentAt,
    }).then((e) => e.sort((a, b) => Number(a.sentAt) - Number(b.sentAt)));
    return {
      prev: !previousPage.length
        ? null
        : previousPage.length > CURSOR_LIMIT
        ? encodeCursor(`asc:gt:${previousPage[0].sentAt}`)
        : encodeCursor(`asc:gt:0`),
      // next: last thread sent at
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

function resolveRedirect({
  isSubdomainbasedRouting,
  communityName,
  channelName,
  settings,
  channel,
}: {
  isSubdomainbasedRouting: boolean;
  communityName: string;
  channelName?: string;
  settings: Settings;
  channel: channels;
}) {
  let url = isSubdomainbasedRouting
    ? '/'
    : `/${settings.prefix}/${communityName}/`;

  url += channelName ? `/c/${channelName}` : `/c/${channel.channelName}`;

  url += `/${encodeCursor('asc:gt:0')}`;

  return {
    redirect: {
      destination: url,
      permanent: false,
    },
  };
}
