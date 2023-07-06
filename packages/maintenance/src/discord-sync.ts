/**
 * ### discord sync

it will get all discord accounts and synchronize it on our database

### cronjob

this process should be executed every 6 hours or less

### run

be sure that your .env file is set up as the .env.example

```bash
yarn install
npx ts-node --skip-project bin/discord-sync/index.ts
```

there also an option to force a full synchronization (used in edge cases when we need to fix something from old messages)

you need to set a flag at the end of the command, full-sync

```bash
yarn install
npx ts-node --skip-project bin/discord-sync/index.ts --full-sync
```

 */
import { prisma } from '@linen/database';
import PQueue from 'p-queue';
import { discordSync } from '@linen/web/services/discord/sync';

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
