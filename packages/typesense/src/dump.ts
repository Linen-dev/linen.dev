import type { Logger } from '@linen/types';
import {
  getAccountSettings,
  persistEndFlag,
  pushToTypesense,
  queryThreads,
  threadsWhere,
} from './utils/shared';

export async function dump({
  accountId,
  logger,
}: {
  accountId: string;
  logger: Logger;
}) {
  const accountSettings = await getAccountSettings(accountId, logger);
  if (!accountSettings) return;
  let cursor = 0;
  do {
    const threads = await queryThreads({
      where: {
        ...threadsWhere({ accountId }),
        incrementId: { gt: cursor },
      },
      orderBy: { incrementId: 'asc' },
      take: 300,
    });

    if (!threads.length) {
      break;
    }

    cursor = threads.at(threads.length - 1)?.incrementId!;

    await pushToTypesense({
      threads,
      is_restrict: accountSettings.searchSettings.scope === 'private',
      logger,
    });
  } while (true);

  // set cursor for next sync job
  await persistEndFlag(accountSettings.searchSettings, accountId);
}
