import type { accounts, channels } from '@linen/database';
import { SitemapIndexStream, SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { appendProtocol } from './url';
import {
  findChannelByNameAndHost,
  findThreadsByChannelAndCursor,
} from 'lib/sitemap';
import { findAccountByPath } from 'lib/models';
import { findChannelsByAccount } from 'lib/channel';
import { findFreeAccountsWithThreads } from 'lib/account';

function resolveDomain(account: Partial<accounts>) {
  return (
    account.discordDomain || account.slackDomain || account.discordServerId
  );
}

function resolveCommunityPrefix(account: Partial<accounts>) {
  return !!account.discordDomain || !!account.discordServerId ? 'd' : 's';
}

export async function createSitemapForPremium(
  host: string,
  sitemapBuilder: (urls: string[]) => Promise<string> = buildSitemapIndexStream
) {
  const account = await findAccountByPath(host);

  if (!account) {
    throw 'account not found';
  }
  if (account.type === 'PRIVATE') {
    throw 'account is private';
  }

  const channels = await findChannelsByAccount({ account, isCrawler: true });

  if (!channels.length) {
    throw 'account without public channels';
  }

  const urls = channels.map(({ channelName }) =>
    encodeURI(`${appendProtocol(host)}/sitemap/c/${channelName}/chunk.xml`)
  );

  return sitemapBuilder(urls);
}

export async function createSitemapForLinen(
  host: string,
  sitemapBuilder: (urls: string[]) => Promise<string> = buildSitemapIndexStream
) {
  const freeAccounts = await findFreeAccountsWithThreads();
  if (!freeAccounts || !freeAccounts.length) {
    throw 'no free accounts';
  }

  const httpHost = appendProtocol(host);

  const urls = freeAccounts
    .filter((account) => {
      const domain = resolveDomain(account);
      return !!domain;
    })
    .map((account) => {
      const letter = resolveCommunityPrefix(account);
      const domain = resolveDomain(account);
      return encodeURI(`${httpHost}/sitemap/${letter}/${domain}/chunk.xml`);
    })
    .filter(Boolean);

  return sitemapBuilder(urls);
}

export async function createSitemapForFree(
  host: string,
  community: string,
  communityPrefix: string,
  sitemapBuilder: (urls: string[]) => Promise<string> = buildSitemapIndexStream
) {
  const account = await findAccountByPath(community);
  if (!account) {
    throw "account doesn't exist";
  }
  if (account.type === 'PRIVATE') {
    throw 'account is private';
  }

  const httpHost = appendProtocol(host);

  const channels = await findChannelsByAccount({ account, isCrawler: true });
  const urls = channels.map(({ channelName }) =>
    encodeURI(
      `${httpHost}/sitemap/${communityPrefix}/${community}/c/${channelName}/chunk.xml`
    )
  );

  if (!urls.length) {
    throw "account doesn't have channels";
  }

  return sitemapBuilder(urls);
}

async function internalCreateSitemapByChannel(
  host: string,
  channelName: string
) {
  const channel = await findChannelByNameAndHost(channelName, host);
  if (!channel) {
    throw 'channel not found';
  }
  if (!channel.pages) {
    throw 'channel is empty';
  }

  let chunks: string[] = [];
  let next = BigInt(Date.now() * 1000);

  for (;;) {
    const result = await queryThreads({
      channel,
      next,
    });
    if (result.err) break;
    result.chunk?.length &&
      chunks.push(...result.chunk.map((c) => encodeURI(c)));

    if (!result.nextCursor) {
      break;
    } else {
      next = result.nextCursor;
    }

    if (chunks?.length && chunks.length >= 10000) {
      console.error({
        error: "isn't issue, just a flag on sitemap builder process",
        problem: 'this channel has more than 10k threads',
        channel,
      });
      break;
    }
  }

  chunks.push(encodeURI(`c/${channelName}`)); // latest

  const max = 50000;
  const total = channel.pages;
  const spotsAvail = max - chunks.length;
  const loopUntil = spotsAvail > total ? 0 : total - spotsAvail;

  for (let idx = total; idx > loopUntil; idx--) {
    chunks.push(encodeURI(`c/${channelName}/${idx}`));
  }

  return chunks;
}

async function queryThreads({
  channel,
  next,
}: {
  channel: channels;
  next: bigint;
}) {
  let err: any,
    nextCursor: bigint | undefined,
    chunk: string[] = [];
  try {
    const threads = await findThreadsByChannelAndCursor(channel.id, next);
    if (!threads?.length) return {};

    for (const thread of threads) {
      chunk.push(
        `t/${thread.incrementId}/${thread.slug?.toLowerCase() || 'topic'}`
      );
    }

    nextCursor = threads.pop()?.sentAt;
  } catch (error) {
    console.error(error);
    err = error;
  }

  return { err, nextCursor, chunk };
}

export async function createSitemapForPremiumByChannel(
  host: string,
  channelName: string,
  sitemapBuilder: (
    hostname: string,
    sitemap: string[]
  ) => Promise<string> = buildSitemapStream
) {
  const sitemap = await internalCreateSitemapByChannel(host, channelName);
  const hostname = `${appendProtocol(host)}/`;
  return sitemapBuilder(hostname, sitemap);
}

export async function createSitemapForFreeByChannel(
  host: string,
  channelName: string,
  communityName: string,
  communityPrefix: string,
  sitemapBuilder: (
    hostname: string,
    sitemap: string[]
  ) => Promise<string> = buildSitemapStream
) {
  const sitemap = await internalCreateSitemapByChannel(
    communityName as string,
    channelName as string
  );
  if (!sitemap.length) throw 'empty channel';

  const hostname = encodeURI(
    `${appendProtocol(host)}/${communityPrefix}/${communityName}/`
  );
  return sitemapBuilder(hostname, sitemap);
}

function buildSitemapStream(hostname: string, sitemap: string[]) {
  const stream = new SitemapStream({
    hostname,
  });
  return streamToPromise(Readable.from(sitemap).pipe(stream)).then((data) =>
    data.toString()
  );
}

function buildSitemapIndexStream(urls: string[]) {
  const stream = new SitemapIndexStream();
  return streamToPromise(Readable.from(urls).pipe(stream)).then(String);
}
