import prisma from '../../client';
import { discordSync } from '../../services/discord';

(async () => {
  const fullSync = !!process.argv.find((arg) => arg === '--full-sync');
  console.log('fullSync', fullSync);

  const discordAccounts = await prisma.accounts.findMany({
    select: { id: true },
    where: { discordServerId: { not: null } },
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
})();
