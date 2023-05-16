import { prisma } from '@linen/database';
import PQueue from 'p-queue';
import { discordSync } from 'services/discord/sync';

const queue = new PQueue({ concurrency: 10 });

// @ts-ignore
queue.on('error', (error) => {
  console.error('error', error);
});

// @ts-ignore
queue.on('completed', (result) => {
  console.log('completed', result);
  queue.add(() => discordSync({ ...result, loop: (result.loop || 1) + 1 }));
});

process.on('uncaughtException', (error, source) => {
  console.error(process.stderr.fd, error, source);
});

(async () => {
  const fullSync = !!process.argv.find((arg) => arg === '--full-sync');
  const accountIdFlag = process.argv.find((arg) =>
    arg.startsWith('--account-id=')
  );
  let accountId = accountIdFlag?.split('=')?.pop();

  if (accountId) {
    await discordSync({ accountId });
  } else {
    await createJobs();
  }
})();

async function createJobs() {
  const accounts = await prisma.accounts.findMany({
    select: { id: true },
    where: { discordServerId: { not: null } },
    orderBy: { createdAt: 'desc' },
  });
  const jobs: any = [];
  accounts.map((acc) =>
    jobs.push(queue.add(() => discordSync({ accountId: acc.id })))
  );
  return jobs;
}
