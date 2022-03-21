import { SitemapStream, SitemapIndexStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import prisma from '../client';

const PROTOCOL = 'https';

export async function createXMLSitemapForSubdomain(
  host: string,
  subdomain: string
): Promise<string> {
  const account = await prisma.accounts.findFirst({
    where: {
      OR: [
        {
          redirectDomain: host,
        },
        {
          slackDomain: subdomain,
        },
      ],
    },
    select: {
      channels: {
        select: {
          slackThreads: {
            select: {
              incrementId: true,
              slug: true,
              messages: true,
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
          return t.messages.length > 0;
        })
        .map(({ incrementId, slug }) => ({
          incrementId,
          slug,
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
