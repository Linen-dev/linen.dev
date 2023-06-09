import { buildPages } from './buildPages';
import { prisma } from '@linen/database';
import PQueue from 'p-queue';
import { logger } from './log';

const queue = new PQueue({ concurrency: 5 });

// @ts-ignore
queue.on('error', (error) => {
  logger.error('error', error);
});

// @ts-ignore
queue.on('completed', (result) => {
  logger.info('completed', result);
});

(async () => {
  const accountId = process.argv.length > 2 ? process.argv[2] : undefined;
  if (accountId) {
    await buildPages(accountId);
  } else {
    await createJobs();
  }
})();

async function createJobs() {
  const accounts = await prisma.accounts.findMany();
  const jobs: any = [];
  accounts.map((acc) => jobs.push(queue.add(() => buildPages(acc.id))));
  return jobs;
}
