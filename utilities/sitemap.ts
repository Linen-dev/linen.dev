import { SitemapStream, SitemapIndexStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import prisma from '../client';

const PROTOCOL = 'https';

export async function createXMLSitemap(domain): Promise<string> {
  const subdomains = await prisma.accounts.findMany({
    where: {
      NOT: {
        name: null,
      },
    },
    select: { name: true },
  });
  const sitemaps = [
    ...subdomains.map(
      (subdomain) => `${PROTOCOL}://${subdomain.name}.${domain}/sitemap.xml`
    ),
  ];

  const stream = new SitemapIndexStream();
  return streamToPromise(Readable.from(sitemaps).pipe(stream)).then((data) =>
    data.toString()
  );
}

export async function createXMLSitemapForSubdomain(
  domain,
  subdomain
): Promise<string> {
  const account = await prisma.accounts.findFirst({
    where: { name: subdomain },
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
    hostname: `${PROTOCOL}://${subdomain}.${domain}`,
  });

  const urls = threads.map(({ incrementId, slug }) => {
    return `/t/${incrementId}/${slug}`;
  });

  return streamToPromise(Readable.from(urls).pipe(stream)).then((data) =>
    data.toString()
  );
}
