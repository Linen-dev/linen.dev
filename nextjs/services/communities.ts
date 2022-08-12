import { findAccountByPath } from '../lib/models';
import { GetStaticPropsContext } from 'next/types';
import { NotFound } from '../utilities/response';
import { revalidateInSeconds } from '../constants/revalidate';
import { buildSettings } from './accountSettings';
import { memoize } from '../utilities/dynamoCache';
import { findPreviousCursor, findThreadsByCursor } from '../lib/threads';
import serializeThread from '../serializers/thread';
import {
  AccountWithSlackAuthAndChannels,
  ThreadsWithMessagesFull,
} from 'types/partialTypes';
import type { channels, accounts } from '@prisma/client';
import { decodeCursor, encodeCursor } from '../utilities/cursor';
import { shouldThisChannelBeAnonymous } from '../lib/channel';
import {
  findAccountsFreeDiscordWithMessages,
  findAccountsFreeSlackWithMessages,
  findAccountsPremiumWithMessages,
} from 'lib/account';
import {
  ChannelViewCursorProps,
  ChannelViewProps,
} from 'components/Pages/Channels';
import { captureExceptionAndFlush } from 'utilities/sentry';

const CURSOR_LIMIT = 10;

function buildInviteUrl(account: accounts) {
  if (account.discordServerId) {
    return `https://discord.com/channels/${account.discordServerId}`;
  } else {
    return account.communityInviteUrl || '';
  }
}

export async function channelGetStaticProps(
  context: GetStaticPropsContext,
  isSubdomainbasedRouting: boolean
): Promise<{
  props?: ChannelViewProps;
  revalidate: number;
  notfound?: boolean;
}> {
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

  const { sort, direction, sentAt } = decodeCursor(cursor);

  const threads = (
    await findThreadsByCursorMemo({
      channelId: channel.id,
      sentAt,
      sort,
      direction,
      anonymizeUsers: account.anonymizeUsers,
    })
  ).sort(sortBySentAtAsc);

  const nextCursor = await buildCursor({
    pathCursor: page,
    threads,
    sort,
    sentAt,
    channelId: channel.id,
  });

  return {
    props: {
      communityName,
      nextCursor,
      currentChannel: channel,
      channelName: channel.channelName,
      channels: account.channels,
      threads: threads.map(serializeThread),
      settings: buildSettings(account),
      isSubDomainRouting: isSubdomainbasedRouting,
      communityInviteUrl: buildInviteUrl(account),
      pathCursor: page || null,
      users: [], // not sure why?
    },
    revalidate: revalidateInSeconds, // In seconds
  };
}

const SKIP_CACHING_ON_BUILD_STEP =
  process.env.SKIP_CACHING_ON_BUILD_STEP === 'true' || false;

export async function channelGetStaticPaths(pathPrefix: string) {
  if (SKIP_CACHING_ON_BUILD_STEP) {
    console.log('hit skip caching on build step');
    return {
      paths: [],
      fallback: true,
    };
  }

  const paths = await getPathsFromPrefix(pathPrefix);

  return {
    paths: paths.map((p) => `${pathPrefix}/${p}/`),
    fallback: true,
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

export async function channelNextPage(channelId: string, cursor: string) {
  // since we only support infinity scroll up,
  // we will hard code sort (desc) and direction (lt)
  const { sentAt } = decodeCursor(cursor);
  const anonymizeUsers = await shouldThisChannelBeAnonymousMemo(channelId);
  const threads = await findThreadsByCursorMemo({
    channelId,
    sentAt,
    sort: 'desc',
    direction: 'lt',
    anonymizeUsers,
  }).then((t) => t.sort(sortBySentAtAsc));

  const nextCursor = await buildCursor({ sort: 'desc', threads, channelId });

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

async function buildCursor({
  pathCursor,
  threads,
  sort,
  channelId,
  sentAt,
}: {
  pathCursor?: string;
  threads: ThreadsWithMessagesFull[];
  sort: string;
  channelId: string;
  sentAt?: string;
}): Promise<ChannelViewCursorProps> {
  try {
    const isCrawler = !!pathCursor;

    if (isCrawler) {
      // crawler
      const previousPage = await findPreviousCursor({
        channelId,
        direction: 'lt',
        sort: 'desc',
        sentAt,
      }).then((e) => e.sort((a, b) => Number(a.sentAt) - Number(b.sentAt)));
      return {
        // prev: we need to query our db
        prev: !previousPage.length
          ? null
          : previousPage.length > CURSOR_LIMIT
          ? encodeCursor(`asc:gt:${previousPage[0].sentAt.toString()}`)
          : encodeCursor(`asc:gt:0`),
        // next: last thread sent at
        next:
          threads.length === CURSOR_LIMIT
            ? encodeCursor(
                `asc:gt:${threads[threads.length - 1].sentAt.toString()}`
              )
            : null,
      };
    } else {
      // users
      return {
        // prev: first thread from result
        prev:
          threads.length === CURSOR_LIMIT
            ? encodeCursor(`${sort}:lt:${threads[0].sentAt.toString()}`)
            : null,
        // next: always null
        next: null,
      };
    }
  } catch (error) {
    await captureExceptionAndFlush(error);
    console.error(error);
    return {
      prev: null,
      next: null,
    };
  }
}
