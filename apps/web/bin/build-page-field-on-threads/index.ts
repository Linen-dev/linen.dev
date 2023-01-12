import { buildPages } from './buildPages';
import prisma from 'client';
import PQueue from 'p-queue';

const queue = new PQueue({ concurrency: 5 });

queue.on('error', (error) => {
  console.error('error', error);
});

queue.on('completed', (result) => {
  console.error('completed', result);
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
