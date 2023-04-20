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

export async function build(
  uploadFile: (args: { Key: string; Body: any }) => Promise<any>
) {
  const {
    channels,
    accountsPremium,
    accountsFree,
  }: {
    channels: Record<string, ChannelType>;
    accountsPremium: Record<string, AccountType>;
    accountsFree: Record<string, AccountType>;
  } = await getAccountsAndChannels();

  const {
    sitemapPremium,
    sitemapFree,
  }: { sitemapPremium: Record<string, UrlType[]>; sitemapFree: UrlType[] } =
    await getThreads(channels);

  const workDir = resolve(os.tmpdir(), Date.now().toString());
  // const workDir = resolve('./sitemap', Date.now().toString()); // run-local
  await fs.mkdir(workDir, { recursive: true });

  for (let [accountId, threads] of Object.entries(sitemapPremium)) {
    const account = accountsPremium[accountId];
    await buildCustomDomainSitemap(workDir, account, threads);
    await buildRobots(account.customDomain, workDir).catch(console.error);
  }

  await buildLinenSitemap(workDir, sitemapFree, accountsFree);
  await buildRobots(linenDomain, workDir).catch(console.error);

  const result = await uploadDir(uploadFile, resolve(workDir));
  console.log('files uploaded', result.length);
}
