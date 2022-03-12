import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';

const PROTOCOL = 'https';
const DOMAIN = process.env.DOMAIN || 'localhost:3000';

export async function createXMLSitemap() {
  const links = [{ url: '/signup' }];
  const stream = new SitemapStream({ hostname: `${PROTOCOL}://${DOMAIN}` });

  return streamToPromise(Readable.from(links).pipe(stream)).then((data) =>
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
