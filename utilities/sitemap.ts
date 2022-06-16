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

  const accountChannels = await prisma.channels.findMany({
    where: {
      account: { id: account.id },
      hidden: false,
    },
    select: {
      channelName: true,
      slackThreads: {
        select: {
          incrementId: true,
          slug: true,
          messages: {
            select: {
              author: true,
            },
          },
        },
        orderBy: { incrementId: 'asc' },
      },
    },
  });

  const channels: Record<string, number> = {};

  const threads = accountChannels.reduce((array: any[], item) => {
    const channelThreads = item.slackThreads
      .filter((t) => {
        return t.messages.length > 1;
      })
      .filter((t) => {
        return t.messages[0].author?.isBot === false;
      });
    channelThreads.length &&
      (channels[item.channelName] = channelThreads.length);
    return [...array, ...channelThreads];
  }, []);

  const stream = new SitemapStream({
    hostname: `${PROTOCOL}://${host}`,
  });

  const urls = threads.map(({ incrementId, slug }) => {
    return `/t/${incrementId}/${slug.toLowerCase() || 'topic'}`;
  });

  const channelsPages: string[] = getChannelPages(channels);
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
  const freeAccounts = await prisma.accounts.findMany({
    select: {
      discordDomain: true,
      discordServerId: true,
      slackDomain: true,
      id: true,
    },
    where: {
      premium: false,
      channels: {
        some: {
          slackThreads: {
            some: {
              messages: { some: { id: { not: undefined } } },
            },
          },
        },
      },
    },
  });
  if (!freeAccounts || !freeAccounts.length) return '';

  const stream = new SitemapIndexStream();
  const urls = freeAccounts.map(
    ({ discordDomain, discordServerId, slackDomain }) => {
      return `${protocol}://${host}/sitemap/${
        discordDomain || discordServerId || slackDomain
      }/chunk.xml`;
    }
  );
  return streamToPromise(Readable.from(urls).pipe(stream)).then(String);
}

export async function createXMLSitemapForFreeCommunity(
  host: string,
  community: string
) {
  // community could be discordServerId/discordDomain or slackDomain
  const threads = await prisma.slackThreads.findMany({
    select: {
      incrementId: true,
      slug: true,
      channel: {
        select: {
          channelName: true,
          account: {
            select: {
              discordDomain: true,
              discordServerId: true,
              slackDomain: true,
            },
          },
        },
      },
    },
    where: {
      messages: { some: { id: { not: undefined } } },
      channel: {
        hidden: false,
        account: {
          OR: [
            { discordDomain: community },
            { discordServerId: community },
            { slackDomain: community },
          ],
        },
      },
    },
    orderBy: {
      incrementId: 'asc',
    },
  });
  const channels: Record<string, number> = {};

  const protocol = host.includes('localhost') ? 'http' : PROTOCOL;
  const stream = new SitemapStream({
    hostname: `${protocol}://${host}`,
  });
  if (!threads || !threads.length) return '';
  const prefix = threads[0].channel.account?.discordServerId ? 'd' : 's';
  const urls = threads?.map(({ incrementId, slug, channel }) => {
    channels[channel.channelName]
      ? channels[channel.channelName]++
      : (channels[channel.channelName] = 1);
    return `/${prefix}/${community}/t/${incrementId}/${
      slug || 'topic'
    }`.toLowerCase();
  });
  const channelsPages: string[] = getChannelPages(
    channels,
    `/${prefix}/${community}`
  );
  if (!channelsPages.length || !urls.length) return '';

  return streamToPromise(
    Readable.from([...channelsPages, ...urls]).pipe(stream)
  ).then(String);
}
