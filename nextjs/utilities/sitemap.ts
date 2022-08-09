import type { channels } from '@prisma/client';
import { SitemapStream, SitemapIndexStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import prisma from '../client';
import { encodeCursor } from './cursor';

const resolveProtocol = (host: string) => {
  return ['localhost'].includes(host) ? 'http' : 'https';
};

export const buildSitemapQueries = {
  byAccountId: (accountId: string) => prisma.$queryRaw<
    { channelName: string; incrementId: number; slug: string }[]
  >`
  select c."channelName", st."incrementId", st.slug, count(m.id)
  from "threads" st 
  join channels c on st."channelId" = c.id
  join messages m on m."threadId" = st.id
  where c."accountId" = ${accountId}
  and c.hidden is false
  group by 1,2,3
  having count(m.id) > 1
  order by 1,2`,
  byChannelId: (channelId: string) => prisma.$queryRaw<
    { channelName: string; incrementId: number; slug: string }[]
  >`
  select c."channelName", st."incrementId", st.slug, count(m.id)
  from "threads" st 
  join channels c on st."channelId" = c.id
  join messages m on m."threadId" = st.id
  where c.id = ${channelId}
  group by 1,2,3
  having count(m.id) > 1
  order by 1,2`,
  channelsFromAccountId: (accountId: string) => prisma.$queryRaw<
    { channelName: string; id: string }[]
  >`select c."channelName", c.id from channels c
  where c."accountId" = ${accountId}
  and c.hidden is false
  and exists (
    select 1 from "threads" st 
    where st."channelId" = c.id
    group by c.id, st.id
   )`,
  freeAccounts: () => prisma.$queryRaw<{ id: string; domain: string }[]>`
  select a.id, coalesce(a."discordDomain",a."discordServerId",a."slackDomain") as "domain"
  from accounts a 
  join channels c on c."accountId" = a.id 
  join "threads" st on st."channelId" = c.id
  join messages m on m."threadId" = st.id
  where premium is false
  and coalesce(a."discordDomain",a."discordServerId",a."slackDomain") is not null
  group by 1`,
};

// fn very similar to createXMLSitemapForLinen
export async function createXMLSitemapForSubdomain(
  host: string
): Promise<string> {
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
  const channels = await buildSitemapQueries.channelsFromAccountId(account.id);

  const stream = new SitemapIndexStream();

  const urls = channels.map(({ channelName }) => {
    return `${resolveProtocol(
      host
    )}://${host}/sitemap/c/${channelName}/chunk.xml`;
  });

  return streamToPromise(Readable.from(urls).pipe(stream)).then((data) =>
    data.toString()
  );
}

async function buildSitemap(
  account: { id: string },
  host: string,
  prefix = '',
  query: 'byAccountId' | 'byChannelId' = 'byAccountId'
) {
  const threads = await buildSitemapQueries[query](account.id);

  const channels: Record<string, number> = {};

  const stream = new SitemapStream({
    hostname: `${resolveProtocol(host)}://${host}`,
  });

  const urls = threads.map(({ channelName, incrementId, slug }) => {
    !!channels[channelName]
      ? channels[channelName]++
      : (channels[channelName] = 1);
    return `${prefix}/t/${incrementId}/${slug?.toLowerCase() || 'topic'}`;
  });
  const channelsPages: string[] = getChannelPages(channels, prefix);
  if (!channelsPages.length || !urls.length) return '';

  return streamToPromise(
    Readable.from([...channelsPages, ...urls]).pipe(stream)
  ).then((data) => data.toString());
}

function getChannelPages(channels: Record<string, number>, prefix = '') {
  const channelsPages: string[] = [];
  for (const [channel, threads] of Object.entries(channels)) {
    const pages = Math.floor(threads / 10) + (threads % 10 > 0 ? 1 : 0);
    for (let i = 0; i < pages; i++) {
      channelsPages.push(`${prefix}/c/${channel}/${i + 1}`);
    }
  }
  return channelsPages;
}

export async function createXMLSitemapForLinen(host: string) {
  const protocol = resolveProtocol(host);
  const freeAccounts = await buildSitemapQueries.freeAccounts();
  if (!freeAccounts || !freeAccounts.length) return '';
  const stream = new SitemapIndexStream();
  const urls = freeAccounts.map(({ domain }) => {
    return `${protocol}://${host}/sitemap/${domain}/chunk.xml`;
  });
  return streamToPromise(Readable.from(urls).pipe(stream)).then(String);
}

export async function createXMLSitemapForFreeCommunity(
  host: string,
  community: string
) {
  // community could be discordServerId/discordDomain or slackDomain
  const account = await prisma.accounts.findFirst({
    where: {
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
  if (!account) {
    return Promise.reject();
  }
  const prefix = account.discordServerId ? 'd' : 's';
  return await buildSitemap(account, host, [prefix, community].join('/'));
}

export async function createXMLSitemapForChannel(
  host: string,
  channelName: string
) {
  const channel = await prisma.channels.findFirst({
    where: {
      channelName,
      account: { redirectDomain: host },
      hidden: false,
    },
  });
  if (!channel) {
    return Promise.reject();
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

    chunk?.length && chunks.push(...chunk);

    next = nextCursor;
    if (!next) break;
  }

  const stream = new SitemapStream({
    hostname: `${resolveProtocol(host)}://${host}`,
  });
  if (chunks.length) {
    return streamToPromise(Readable.from(chunks).pipe(stream)).then((data) =>
      data.toString()
    );
  }
  return;
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
    // console.log('nextCursor', nextCursor);
  } catch (error) {
    console.error(error);
    err = error;
  }
  return { err, nextCursor, chunk };
}
