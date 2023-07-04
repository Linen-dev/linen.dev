import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import { resolve } from 'path';
import { EnumChangefreq, SitemapAndIndexStream, SitemapStream } from 'sitemap';
import { finished } from 'node:stream/promises';
import { UrlType, AccountType } from './types';
import { linenDomain } from '../config';

export async function buildLinenSitemap(
  workDir: string,
  sitemapFree: UrlType[],
  accountsFree: Record<string, AccountType>
) {
  await fs.mkdir(`${workDir}/sitemap/${linenDomain}`, {
    recursive: true,
  });

  const hostname = `https://${linenDomain}`;

  const sms = new SitemapAndIndexStream({
    limit: 10000,
    getSitemapStream: (i: number) => {
      const sitemapStream = new SitemapStream({ hostname });
      const path = `./sitemap/${linenDomain}/sitemap-${i}.xml`;
      const ws = sitemapStream.pipe(createWriteStream(resolve(workDir, path)));
      return [new URL(path, hostname).toString(), sitemapStream, ws];
    },
  });

  sms.pipe(
    createWriteStream(resolve(workDir, `./sitemap/${linenDomain}/sitemap.xml`))
  );

  for (const thread of sitemapFree) {
    sms.write(thread);
  }

  for (const [_, account] of Object.entries(accountsFree)) {
    for (const channel of account.channels) {
      sms.write({
        url: encodeURI(`${account.pathDomain}/c/${channel.channelName}`),
        priority: 1.0,
        changefreq: EnumChangefreq.DAILY,
      });
    }
  }

  sms.end();
  await finished(sms);
  console.log('finished', linenDomain);
}
