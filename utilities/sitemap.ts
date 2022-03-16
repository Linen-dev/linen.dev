import { SitemapStream, SitemapIndexStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import prisma from '../client';

const PROTOCOL = 'https';

export async function createXMLSitemapForSubdomain(
  host,
  subdomain
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
            },
          },
        },
      },
    },
  });

  if (!account) {
    return Promise.reject();
  }

  const threads = account.channels.reduce((array, item) => {
    return [
      ...array,
      ...item.slackThreads.map(({ incrementId, slug }) => ({
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
