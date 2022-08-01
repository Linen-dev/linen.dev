import { accountsWithChannels, findAccountByPath } from '../lib/models';
import { GetStaticPropsContext } from 'next/types';
import { stripProtocol } from '../utilities/url';
import { NotFound } from '../utilities/response';
import { revalidateInSeconds } from '../constants/revalidate';
import { buildSettings } from './accountSettings';
import { memoize } from '../utilities/dynamoCache';
import { findThreadsByCursor } from '../lib/threads';
import serializeThread from '../serializers/thread';
import { AccountWithSlackAuthAndChannels } from 'types/partialTypes';
import type { channels } from '@prisma/client';
import { decodeCursor, encodeCursor } from '../utilities/cursor';
import { shouldThisChannelBeAnonymous } from '../lib/channel';

export async function channelGetStaticProps(
  context: GetStaticPropsContext,
  isSubdomainbasedRouting: boolean
) {
  const communityName = context.params?.communityName as string;
  const channelName = context.params?.channelName as string;
  const page = context.params?.page as string;
  const cursor = parsePageParam(page);

  const account = (await findAccountByPathMemo(communityName, {
    include: { channels: { where: { hidden: false } } },
  })) as AccountWithSlackAuthAndChannels;
  if (!account) return NotFound();

  const channel = findChannelOrDefault(account.channels, channelName);
  if (!channel) return NotFound();

  const threads = await findThreadsByCursorMemo({
    channelId: channel.id,
    sentAt: cursor && decodeCursor(cursor),
    anonymizeUsers: account.anonymizeUsers,
  });
  const nextCursor = threads.length === 10 && threads[9].sentAt.toString();

  return {
    props: {
      communityName,
      ...(nextCursor && { nextCursor: encodeCursor(nextCursor) }),
      currentChannel: channel,
      channelName: channel.channelName,
      channels: account.channels,
      threads: threads.map(serializeThread),
      settings: buildSettings(account),
      isSubDomainRouting: isSubdomainbasedRouting,
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

  const accounts = await accountsWithChannels();
  const acc = accounts.filter((a) => a.channels.length > 0);
  let redirectDomains = acc
    .map((a) => {
      return a.redirectDomain && stripProtocol(a.redirectDomain);
    })
    .filter(Boolean);

  const paths = redirectDomains.concat(
    acc
      .map((a) => {
        return a.slackDomain;
      })
      .filter(Boolean)
  );

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
  const anonymizeUsers = await shouldThisChannelBeAnonymousMemo(channelId);
  const threads = await findThreadsByCursorMemo({
    channelId,
    sentAt: cursor,
    anonymizeUsers,
  });
  const nextCursor = threads.length === 10 && threads[9].sentAt.toString();
  return {
    threads: threads.map(serializeThread),
    ...(nextCursor && { nextCursor: encodeCursor(nextCursor) }),
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
