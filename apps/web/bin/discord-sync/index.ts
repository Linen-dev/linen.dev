import prisma from '../../client';
import { discordSync } from '../../services/discord/sync';

function isInfiniteSync() {
  return process.env.LONG_RUNNING === 'true';
}

async function init() {
  if (isInfiniteSync()) {
    for (;;) {
      await runSync();
    }
  } else {
    const fullSync = !!process.argv.find((arg) => arg === '--full-sync');

    const accountIdFlag = process.argv.find((arg) =>
      arg.startsWith('--account-id=')
    );

    let accountId;

    if (accountIdFlag) {
      console.log({ accountIdFlag });
      accountId = accountIdFlag.split('=').pop() as string;
    }
    await runSync(accountId, fullSync);
  }
}

async function runSync(accountId?: string, fullSync?: boolean) {
  const discordAccounts = await prisma.accounts.findMany({
    select: { id: true },
    where: { discordServerId: { not: null }, id: accountId },
  });

  console.log({ discordAccounts });

  for (const account of discordAccounts) {
    await discordSync({ accountId: account.id, fullSync })
      .then(() => {
        console.log('Syncing done!', account);
      })
      .catch((err) => {
        console.error('Syncing error: ', err, account);
      });
  }
}

init();
