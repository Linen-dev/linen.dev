import { prisma } from '@linen/database';
import type { Logger } from '@linen/types';
import {
  getAccountSettings,
  getQuery,
  mapAndPersist,
  persistEndFlag,
} from './shared';

export async function dump({
  accountId,
  logger,
}: {
  accountId: string;
  logger: Logger;
}) {
  const searchSettings = await getAccountSettings(accountId);
  let cursor = 0;
  do {
    const defaultQuery = getQuery(accountId);
    const threads = await prisma.threads.findMany({
      ...defaultQuery,
      where: {
        ...defaultQuery.where,
        incrementId: { gt: cursor },
      },
    });

    if (!threads.length) {
      break;
    }

    cursor = threads.at(threads.length - 1)?.incrementId!;

    await mapAndPersist(threads, searchSettings, logger);
  } while (true);

  // set cursor for next sync job
  await persistEndFlag(searchSettings, accountId);
}
