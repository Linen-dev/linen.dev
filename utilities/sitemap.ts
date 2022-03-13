import { SitemapStream, SitemapIndexStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import prisma from '../client';
import { DOMAIN } from './domain';

const PROTOCOL = 'https';

export async function createXMLSitemap(): Promise<string> {
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
      (subdomain) => `${PROTOCOL}://${subdomain.name}.${DOMAIN}/sitemap.xml`
    ),
  ];

  const stream = new SitemapIndexStream();
  return streamToPromise(Readable.from(sitemaps).pipe(stream)).then((data) =>
    data.toString()
  );
}

export async function createXMLSitemapForSubdomain(subdomain): Promise<string> {
  const account = await prisma.accounts.findFirst({
    where: { name: subdomain },
    select: {
      channels: {
        select: {
          slackThreads: {
            select: {
              incrementId: true,
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
      ...item.slackThreads.map(({ incrementId }) => incrementId),
    ];
  }, []);

  const stream = new SitemapStream({
    hostname: `${PROTOCOL}://${subdomain}.${DOMAIN}`,
  });

  const urls = threads.map((id) => {
    return `/t/${id}`;
  });

  return streamToPromise(Readable.from(urls).pipe(stream)).then((data) =>
    data.toString()
  );
}
