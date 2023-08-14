import { prisma } from '@linen/database';
import type { Logger, SerializedSearchSettings } from '@linen/types';
import { sync } from './sync';

export async function syncAll({ logger }: { logger: Logger }) {
  const accounts = await prisma.accounts.findMany({
    select: { id: true, searchSettings: true },
    where: { searchSettings: { not: null } },
  });

  logger.log(accounts);

  for (const account of accounts) {
    if (!account.searchSettings) {
      continue;
    }
    const searchSettings: SerializedSearchSettings = JSON.parse(
      account.searchSettings
    );
    if (!searchSettings.lastSync) {
      continue;
    }
    await sync({ accountId: account.id, logger });
  }
}
