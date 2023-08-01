import fs from 'fs/promises';
import { resolve } from 'path';
import os from 'os';
import { buildRobots } from './robots';
import { uploadDir } from './s3-sync';
import { UrlType, ChannelType, AccountType } from './utils/types';
import { getThreads } from './utils/getThreads';
import { getAccountsAndChannels } from './utils/getAccountsAndChannels';
import { buildCustomDomainSitemap } from './utils/buildCustomDomainSitemap';
import { buildLinenSitemap } from './utils/buildLinenSitemap';
import { linenDomain } from './config';
import { Logger } from '@linen/types';

export async function build(
  uploadFile: (args: {
    Key: string;
    Body: any;
    CacheControl?: string;
  }) => Promise<any>,
  logger: Logger
) {
  const {
    channels,
    accountsPremium,
    accountsFree,
  }: {
    channels: Record<string, ChannelType>;
    accountsPremium: Record<string, AccountType>;
    accountsFree: Record<string, AccountType>;
  } = await getAccountsAndChannels(logger);

  const {
    sitemapPremium,
    sitemapFree,
  }: { sitemapPremium: Record<string, UrlType[]>; sitemapFree: UrlType[] } =
    await getThreads(channels, logger);

  const workDir = resolve(
    process.env.RUN_LOCAL ? './sitemap' : os.tmpdir(),
    Date.now().toString()
  );
  await fs.mkdir(workDir, { recursive: true });

  for (let [accountId, threads] of Object.entries(sitemapPremium)) {
    const account = accountsPremium[accountId];
    await buildCustomDomainSitemap(workDir, account, threads, logger);
    await buildRobots(account.customDomain, workDir).catch(logger.error);
  }

  await buildLinenSitemap(workDir, sitemapFree, accountsFree, logger);
  await buildRobots(linenDomain, workDir).catch(logger.error);

  const result = await uploadDir(uploadFile, resolve(workDir));
  logger.log({ 'files uploaded': result.length });
}
