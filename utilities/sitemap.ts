import { SitemapStream, SitemapIndexStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import prisma from '../client';

const PROTOCOL = 'https';

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
  return await buildSitemap(account, host);
}

async function buildSitemap(
  account: { id: string },
  host: string,
  prefix = ''
) {
  const threads = await prisma.$queryRaw<
    { channelName: string; incrementId: number; slug: string }[]
  >`
    select c."channelName", st."incrementId", st.slug, count(m.id)
    from "slackThreads" st 
    join channels c on st."channelId" = c.id
    join messages m on m."slackThreadId" = st.id
    where c."accountId" = ${account.id}
    and c.hidden is false
    group by 1,2,3
    having count(m.id) > 1
    order by 1,2`;

  const channels: Record<string, number> = {};

  const stream = new SitemapStream({
    hostname: `${PROTOCOL}://${host}`,
  });

  const urls = threads.map(({ channelName, incrementId, slug }) => {
    !!channels[channelName]
      ? channels[channelName]++
      : (channels[channelName] = 1);
    return `${prefix}/t/${incrementId}/${slug.toLowerCase() || 'topic'}`;
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
  const protocol = host.includes('localhost') ? 'http' : PROTOCOL;
  const freeAccounts = await prisma.$queryRaw<{ id: string; domain: string }[]>`
  select a.id, coalesce(a."discordDomain",a."discordServerId",a."slackDomain") as "domain"
  from accounts a 
  join channels c on c."accountId" = a.id 
  join "slackThreads" st on st."channelId" = c.id
  join messages m on m."slackThreadId" = st.id
  where premium is false
  and coalesce(a."discordDomain",a."discordServerId",a."slackDomain") is not null
  group by 1`;
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
