import { SitemapStream, SitemapIndexStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import prisma from '../client';

const PROTOCOL = 'https';
const DOMAIN = process.env.DOMAIN || 'localhost:3000';

export async function createXMLSitemap() {
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

export async function createXMLSitemapForSubdomain(subdomain) {
  const stream = new SitemapStream({
    hostname: `${PROTOCOL}://${subdomain}.${DOMAIN}`,
  });

  return streamToPromise(Readable.from([{ url: '/' }]).pipe(stream)).then(
    (data) => data.toString()
  );
}
