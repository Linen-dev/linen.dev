import type { channels } from '@prisma/client';
import { SitemapIndexStream, SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import prisma from '../client';
import { encodeCursor } from './cursor';
import { captureExceptionAndFlush } from 'utilities/sentry';
import createDebug from 'debug';
import { appendProtocol } from './url';

const debug = createDebug('linen:sitemap');

const channelsFromAccountId = (accountId: string) => prisma.$queryRaw<
  { channelName: string; id: string }[]
>`select c."channelName", c.id from channels c
where c."accountId" = ${accountId}
and c.hidden is false
and exists (
select 1 from "threads" st 
where st."channelId" = c.id
group by c.id, st.id
)`;

export async function createSitemapForPremium(host: string): Promise<string> {
  const account = await prisma.accounts.findFirst({
    where: {
      redirectDomain: host,
    },
    select: {
      id: true,
    },
  });

  if (!account) {
    return Promise.reject();
  }
  const channels = await channelsFromAccountId(account.id);

  const stream = new SitemapIndexStream();

  const urls = channels.map(({ channelName }) =>
    encodeURI(`${appendProtocol(host)}/sitemap/c/${channelName}/chunk.xml`)
  );

  return streamToPromise(Readable.from(urls).pipe(stream)).then((data) =>
    data.toString()
  );
}

export async function createSitemapForLinen(host: string) {
  const freeAccounts = await prisma.accounts.findMany({
    select: {
      id: true,
      discordDomain: true,
      discordServerId: true,
      slackDomain: true,
      slackTeamId: true,
      _count: {
        select: {
          channels: true,
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

  const stream = new SitemapIndexStream();
  const urls = freeAccounts
    .map(
      ({
        discordDomain,
        discordServerId,
        slackDomain,
        slackTeamId,
        _count,
        id,
      }) => {
        if (!_count.channels) {
          debug('account without channels', id);
          return;
        }
        const letter = !!discordDomain || !!discordServerId ? 'd' : 's';
        const domain =
          discordDomain || slackDomain || discordServerId || slackTeamId;
        if (!domain) {
          debug('account without name', id);
          return;
        }
        return encodeURI(`${httpHost}/sitemap/${letter}/${domain}/chunk.xml`);
      }
    )
    .filter(Boolean);

  debug('urls', urls);
  return streamToPromise(Readable.from(urls).pipe(stream)).then(String);
}

export async function createSitemapForFree(
  host: string,
  community: string,
  communityPrefix: string
) {
  debug('request', { host, community, communityPrefix });
  // community could be discordServerId/discordDomain or slackDomain
  const account = await prisma.accounts.findFirst({
    where: {
      // TODO: premium must be false
      OR: [
        { discordDomain: community },
        { discordServerId: community },
        { slackDomain: community },
      ],
    },
    select: {
      id: true,
      discordServerId: true,
      slackTeamId: true,
    },
  });
  debug('account %o', account);
  if (!account) throw "account doesn't exist";

  const channels = await channelsFromAccountId(account.id);

  const stream = new SitemapIndexStream();

  const httpHost = appendProtocol(host);

  const urls = channels.map(({ channelName }) =>
    encodeURI(
      `${httpHost}/sitemap/${communityPrefix}/${community}/c/${channelName}/chunk.xml`
    )
  );

  debug('channels %o', urls.length);

  if (!urls.length) throw "account doesn't have channels";

  return streamToPromise(Readable.from(urls).pipe(stream)).then((data) =>
    data.toString()
  );
}

// exported just for testing
export async function internalCreateSitemapByChannel(
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
  channelName: string
) {
  const sitemap = await internalCreateSitemapByChannel(host, channelName);

  const stream = new SitemapStream({
    hostname: `${appendProtocol(host)}/`,
  });
  return await streamToPromise(Readable.from(sitemap).pipe(stream)).then(
    (data) => data.toString()
  );
}

export async function createSitemapForFreeByChannel(
  host: string,
  channelName: string,
  communityName: string,
  communityPrefix: string
) {
  const sitemap = await internalCreateSitemapByChannel(
    communityName as string,
    channelName as string
  );
  const stream = new SitemapStream({
    hostname: encodeURI(
      `${appendProtocol(host)}/${communityPrefix}/${communityName}/`
    ),
  });
  return await streamToPromise(Readable.from(sitemap).pipe(stream)).then(
    (data) => data.toString()
  );
}
