import { accountsWithChannels, findAccountByPath } from '../lib/models';
import { GetStaticPropsContext } from 'next/types';
import { stripProtocol } from '../utilities/url';
import { NotFound } from '../utilities/response';
import { revalidateInSeconds } from '../constants/revalidate';
import { buildSettings } from './accountSettings';
import { memoize } from '../utilities/dynamoCache';
import { findThreadsByCursor } from '../lib/threads';
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
) {
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

  // if cursor exists, it probably means that is a crawler
  // so we won't create a new cursor, it already exists in the sitemap
  const nextCursor = buildCursor({ pathCursor: page, threads, sort });

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
  const { sort, direction, sentAt } = decodeCursor(cursor);
  const anonymizeUsers = await shouldThisChannelBeAnonymousMemo(channelId);
  const threads = (
    await findThreadsByCursorMemo({
      channelId,
      sentAt,
      sort: 'desc',
      direction: 'lt',
      anonymizeUsers,
    })
  ).sort(sortBySentAtAsc);

  const nextCursor =
    threads.length === CURSOR_LIMIT
      ? encodeCursor(`desc:lt:${threads[0].sentAt.toString()}`)
      : null;

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

function buildCursor({
  pathCursor,
  threads,
  sort,
}: {
  pathCursor?: string;
  threads: ThreadsWithMessagesFull[];
  sort: string;
}) {
  const cursorBy = {
    user: `${sort}:lt:${threads[0].sentAt.toString()}`,
    crawler: `${sort}:gt:${threads[threads.length - 1].sentAt.toString()}`,
  };

  return threads.length === CURSOR_LIMIT
    ? encodeCursor(pathCursor ? cursorBy.crawler : cursorBy.user)
    : null;
}
