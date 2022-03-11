import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';

export async function createXMLSitemap(links, hostname) {
  const stream = new SitemapStream({ hostname });

  return streamToPromise(Readable.from(links).pipe(stream)).then((data) =>
    data.toString()
  );
}
