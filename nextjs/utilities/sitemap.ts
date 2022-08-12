import type { channels } from '@prisma/client';
import { SitemapIndexStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import prisma from '../client';
import { encodeCursor } from './cursor';
import { captureExceptionAndFlush } from 'utilities/sentry';

const resolveProtocol = (host: string) => {
  return ['localhost'].includes(host) ? 'http' : 'https';
};

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
  const channels = await channelsFromAccountId(account.id);

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

export async function createXMLSitemapForLinen(host: string) {
  const freeAccounts = await prisma.accounts.findMany({
    select: {
      discordDomain: true,
      discordServerId: true,
      slackDomain: true,
      slackTeamId: true,
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
  const stream = new SitemapIndexStream();
  const urls = freeAccounts.map(
    ({ discordDomain, discordServerId, slackDomain, slackTeamId }) => {
      const letter = !!discordDomain || !!discordServerId ? 'd' : 's';
      const domain =
        discordDomain || slackDomain || discordServerId || slackTeamId;
      return `https://${host}/sitemap/${letter}/${domain}/chunk.xml`;
    }
  );
  return streamToPromise(Readable.from(urls).pipe(stream)).then(String);
}

export async function createXMLSitemapForFreeCommunity(
  host: string,
  community: string,
  communityPrefix: string
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

  const channels = await channelsFromAccountId(account.id);

  const stream = new SitemapIndexStream();

  const urls = channels.map(({ channelName }) => {
    return `https://${host}/sitemap/${communityPrefix}/${community}/c/${channelName}/chunk.xml`;
  });

  return streamToPromise(Readable.from(urls).pipe(stream)).then((data) =>
    data.toString()
  );
}

export async function createXMLSitemapForChannel(
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
    chunk?.length && chunks.push(...chunk);
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
