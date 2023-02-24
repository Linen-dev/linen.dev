import { createWriteStream } from 'fs';
import { resolve } from 'path';
import { SitemapAndIndexStream, SitemapStream } from 'sitemap';
import { Account, SitemapItem, Channel, Thread } from './types';
import { finished } from 'node:stream/promises';

type buildSitemapType = {
  account: Account;
  parseChannel(channel: Channel, idx?: number): SitemapItem;
  parseThread(thread: Thread): SitemapItem;
  getThreadsAsyncIterable(
    account: Account
  ): AsyncGenerator<Thread[], void, unknown>;
  getChannels(account: Account): Promise<Channel[]>;
  workDir: string;
};

export async function buildSitemap({
  account,
  parseChannel,
  parseThread,
  getThreadsAsyncIterable,
  getChannels,
  workDir,
}: buildSitemapType) {
  const hostname = `https://${account.redirectDomain}`;

  let pages;
  const sms = new SitemapAndIndexStream({
    limit: 10000,
    getSitemapStream: (i: number) => {
      pages = i;
      const sitemapStream = new SitemapStream({ hostname });
      const path = `./sitemap/${account.redirectDomain}/sitemap-${i}.xml`;
      const ws = sitemapStream.pipe(createWriteStream(resolve(workDir, path)));
      return [new URL(path, hostname).toString(), sitemapStream, ws];
    },
  });

  sms.pipe(
    createWriteStream(
      resolve(workDir, `./sitemap/${account.redirectDomain}/sitemap.xml`)
    )
  );

  for await (const threads of getThreadsAsyncIterable(account)) {
    for (const thread of threads) {
      sms.write(parseThread(thread));
    }
  }

  const channels = await getChannels(account);
  for (const channel of channels) {
    sms.write(parseChannel(channel, undefined));
  }
  for (const channel of channels) {
    if (channel.pages) {
      for (let idx = channel.pages; idx > 0; idx--) {
        sms.write(parseChannel(channel, idx));
      }
    }
  }

  sms.end();
  await finished(sms);
  console.log('pages', pages);
}
