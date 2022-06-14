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
      channels: {
        select: {
          slackThreads: {
            select: {
              incrementId: true,
              slug: true,
              messages: {
                select: {
                  body: true,
                  author: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!account) {
    return Promise.reject();
  }

  const threads = account.channels.reduce((array: any[], item) => {
    return [
      ...array,
      ...item.slackThreads
        .filter((t) => {
          return t.messages.length > 1;
        })
        .filter((t) => {
          return t.messages[0].author?.isBot === false;
        })
        .map(({ incrementId, slug }) => ({
          incrementId,
          slug: slug?.toLowerCase(),
        })),
    ];
  }, []);

  const stream = new SitemapStream({
    hostname: `${PROTOCOL}://${host}`,
  });

  const urls = threads.map(({ incrementId, slug }) => {
    return `/t/${incrementId}/${slug || 'topic'}`;
  });

  return streamToPromise(Readable.from(urls).pipe(stream)).then((data) =>
    data.toString()
  );
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
  const protocol = host.includes('localhost') ? 'http' : PROTOCOL;
  const stream = new SitemapStream({
    hostname: `${protocol}://${host}`,
  });
  if (!threads || !threads.length) return '';
  const prefix = threads[0].channel.account?.discordServerId ? 'd' : 's';
  const urls = threads?.map(({ incrementId, slug }) => {
    return `/${prefix}/${community}/t/${incrementId}/${
      slug || 'topic'
    }`.toLowerCase();
  });
  return streamToPromise(Readable.from(urls).pipe(stream)).then(String);
}
