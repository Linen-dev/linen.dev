import { getCommunities } from './query';
import fs from 'fs/promises';
import os from 'os';
import { resolve } from 'path';
import { uploadDir } from './s3-sync';
import { processAccount, processLinen } from './build';
import { msToHuman } from './parser';
import { Logger } from './types';

export async function task(
  uploadFile: (args: { Key: string; Body: any }) => Promise<any>,
  logger: Logger
) {
  const start = new Date().getTime();

  const workDir = resolve(os.tmpdir(), Date.now().toString());
  logger('workDir', workDir);
  await fs.mkdir(workDir, { recursive: true });

  // premium
  const accounts = await getCommunities();
  for (const account of accounts) {
    await processAccount(account, workDir, logger);
  }
  // linen.dev
  await processLinen(workDir, logger);

  // upload to s3
  const result = await uploadDir(uploadFile, resolve(workDir));
  logger('files uploaded', result.length);
  // refresh cdn
  const total = new Date().getTime() - start;
  logger('task finished in', msToHuman(total));
}
