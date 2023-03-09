import {
  parseChannel,
  parseThread,
  parseThreadFreeTier,
  parseChannelFreeTier,
  msToHuman,
} from './parser';
import {
  getChannels,
  getThreadsAsyncIterable,
  getThreadsAsyncIterableFreeTier,
  getChannelsFreeTier,
} from './query';
import { buildRobots } from './robots';
import { buildSitemap } from './sitemap';
import fs from 'fs/promises';
import { Account, Logger } from './types';

export async function processLinen(workDir: string, logger: Logger) {
  const linen = 'linen.dev';
  const account = {
    id: linen,
    name: linen,
    redirectDomain: `www.${linen}`,
    discordDomain: null,
    discordServerId: null,
    slackDomain: null,
    premium: false,
  };
  const start = new Date().getTime();
  logger(linen);

  await fs.mkdir(`${workDir}/sitemap/${linen}`, { recursive: true });

  await buildSitemap({
    account,
    getThreadsAsyncIterable: getThreadsAsyncIterableFreeTier,
    parseThread: parseThreadFreeTier,
    getChannels: getChannelsFreeTier,
    parseChannel: parseChannelFreeTier,
    workDir,
  }).catch(logger);
  await buildRobots(linen, workDir).catch(logger);

  const total = new Date().getTime() - start;
  logger(linen, msToHuman(total));
}

export async function processAccount(
  account: Account,
  workDir: string,
  logger: Logger
) {
  const start = new Date().getTime();
  logger(account.redirectDomain);

  await fs.mkdir(`${workDir}/sitemap/${account.redirectDomain}`, {
    recursive: true,
  });

  // build sitemaps
  await buildSitemap({
    account,
    getThreadsAsyncIterable,
    parseThread,
    getChannels,
    parseChannel,
    workDir,
  }).catch(logger);
  // build robots
  await buildRobots(account.redirectDomain, workDir).catch(logger);

  const total = new Date().getTime() - start;
  logger(account.redirectDomain, msToHuman(total));
}
