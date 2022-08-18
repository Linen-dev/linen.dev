import type { channels } from '@prisma/client';
import { SitemapIndexStream, SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import prisma from '../client';
import { encodeCursor } from './cursor';
import { captureExceptionAndFlush } from 'utilities/sentry';
import createDebug from 'debug';
import { appendProtocol } from './url';

const debug = createDebug('linen:sitemap');

export async function createSitemapForPremium(
  host: string,
  sitemapBuilder: (urls: string[]) => Promise<string> = buildSitemapIndexStream
) {
  const account = await prisma.accounts.findFirst({
    select: {
      id: true,
      channels: {
        select: {
          channelName: true,
          _count: {
            select: {
              messages: true,
              threads: true,
            },
          },
        },
        where: {
          hidden: false,
        },
      },
    },
    where: {
      redirectDomain: host,
    },
  });

  if (!account) {
    throw 'account not found';
  }

  const urls = account.channels
    .filter((c) => c._count.messages > 0 && c._count.threads > 0)
    .map(({ channelName }) =>
      encodeURI(`${appendProtocol(host)}/sitemap/c/${channelName}/chunk.xml`)
    );

  return sitemapBuilder(urls);
}

export async function createSitemapForLinen(
  host: string,
  sitemapBuilder: (urls: string[]) => Promise<string> = buildSitemapIndexStream
) {
  const freeAccounts = await prisma.accounts.findMany({
    select: {
      id: true,
      discordDomain: true,
      discordServerId: true,
      slackDomain: true,
      slackTeamId: true,
      channels: {
        select: {
          _count: {
            select: {
              messages: true,
              threads: true,
            },
          },
        },
        where: {
          hidden: false,
        },
      },
    },
    where: {
      premium: false,
      AND: {
        OR: [
          { discordDomain: { not: null } },
          { slackDomain: { not: null } },
          { discordServerId: { not: null } },
          { slackTeamId: { not: null } },
        ],
      },
    },
  });

  if (!freeAccounts || !freeAccounts.length) return '';
  debug('accounts', freeAccounts);

  const httpHost = appendProtocol(host);

  const urls = freeAccounts
    .filter((account) => {
      if (
        !account.channels ||
        !account.channels.length ||
        !account.channels.find((e) => e._count.messages) ||
        !account.channels.find((e) => e._count.threads)
      ) {
        debug('account without channels', account.id);
        return false;
      }
      const domain =
        account.discordDomain ||
        account.slackDomain ||
        account.discordServerId ||
        account.slackTeamId;
      if (!domain) {
        debug('account without name', account.id);
        return false;
      }
      return true;
    })
    .map((account) => {
      const letter =
        !!account.discordDomain || !!account.discordServerId ? 'd' : 's';
      const domain =
        account.discordDomain ||
        account.slackDomain ||
        account.discordServerId ||
        account.slackTeamId;
      return encodeURI(`${httpHost}/sitemap/${letter}/${domain}/chunk.xml`);
    })
    .filter(Boolean);

  debug('urls', urls);
  return sitemapBuilder(urls);
}

export async function createSitemapForFree(
  host: string,
  community: string,
  communityPrefix: string,
  sitemapBuilder: (urls: string[]) => Promise<string> = buildSitemapIndexStream
) {
  debug('request', { host, community, communityPrefix });
  // community could be discordServerId/discordDomain or slackDomain
  const account = await prisma.accounts.findFirst({
    select: {
      id: true,
      discordServerId: true,
      slackTeamId: true,
      channels: {
        select: {
          channelName: true,
          _count: {
            select: {
              messages: true,
              threads: true,
            },
          },
        },
        where: {
          hidden: false,
        },
      },
    },
    where: {
      OR: [
        { discordDomain: community },
        { discordServerId: community },
        { slackDomain: community },
      ],
    },
  });
  debug('account %o', account);
  if (!account) {
    throw "account doesn't exist";
  }

  const httpHost = appendProtocol(host);

  const urls = account.channels
    .filter((c) => c._count.messages > 0 && c._count.threads > 0)
    .map(({ channelName, ...rest }) =>
      encodeURI(
        `${httpHost}/sitemap/${communityPrefix}/${community}/c/${channelName}/chunk.xml`
      )
    );

  debug('channels %o', urls.length);

  if (!urls.length) {
    throw "account doesn't have channels";
  }

  return sitemapBuilder(urls);
}

async function internalCreateSitemapByChannel(
  host: string,
  channelName: string
) {
  const channel = await prisma.channels.findFirst({
    where: {
      channelName,
      account: {
        OR: [
          { discordDomain: host },
          { discordServerId: host },
          { slackDomain: host },
          { redirectDomain: host },
        ],
      },
      hidden: false,
    },
  });
  if (!channel) {
    throw 'channel not found';
  }

  let chunks: string[] = [];
  let next: bigint | undefined;

  for (;;) {
    const { err, nextCursor, chunk } = await queryThreads(
      channel,
      channelName,
      next
    );
    if (err) break;
    chunk?.length && chunks.push(...chunk.map((c) => encodeURI(c)));
    next = nextCursor;
    if (!next) break;

    if (chunks?.length && chunks.length >= 10000) {
      await captureExceptionAndFlush({
        error: "isn't issue, just a flag on sitemap builder process",
        problem: 'this channel has more than 10k threads',
        channel,
      });
      break;
    }
  }

  return chunks;
}

async function queryThreads(
  channel: channels,
  channelName: string,
  next: bigint = BigInt(0)
) {
  let err: any,
    nextCursor: bigint | undefined,
    chunk: string[] = [];
  try {
    const threads = await prisma.threads.findMany({
      where: { channelId: channel.id, sentAt: { gt: next } },
      orderBy: { sentAt: 'asc' },
      select: {
        incrementId: true,
        slug: true,
        messageCount: true,
        sentAt: true,
      },
      take: 10,
    });

    if (!threads?.length) return {};

    chunk.push(`c/${channelName}/${encodeCursor(`asc:gt:${next}`)}`);
    for (const thread of threads) {
      if (thread.messageCount > 1) {
        chunk.push(
          `t/${thread.incrementId}/${thread.slug?.toLowerCase() || 'topic'}`
        );
      }
    }

    nextCursor = threads.pop()?.sentAt;
  } catch (error) {
    await captureExceptionAndFlush(error);
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
