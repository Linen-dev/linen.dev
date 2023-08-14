import { prisma } from '@linen/database';
import type { Logger, SerializedSearchSettings } from '@linen/types';
import {
  getAccountSettings,
  getQuery,
  persistEndFlag,
  mapAndPersist,
} from './shared';

export async function sync({
  accountId,
  logger,
}: {
  accountId: string;
  logger: Logger;
}) {
  const searchSettings = await getAccountSettings(accountId);
  await syncUpdatedThreads(searchSettings, accountId, logger);

  // set cursor for next sync job
  await persistEndFlag(searchSettings, accountId);
}

async function syncUpdatedThreads(
  searchSettings: SerializedSearchSettings,
  accountId: string,
  logger: Logger
) {
  let cursor = new Date(searchSettings.lastSync || 0);
  let stats = 0;
  do {
    const defaultQuery = getQuery(accountId);
    const messages = await prisma.messages.findMany({
      select: { threadId: true, updatedAt: true },
      where: {
        threads: {
          ...defaultQuery.where,
        },
        updatedAt: { gt: cursor },
      },
      orderBy: { updatedAt: 'asc' },
    });

    const threads = await prisma.threads.findMany({
      include: defaultQuery.include,
      where: {
        id: { in: [...new Set(messages.map((m) => m.threadId!))] },
      },
    });

    if (!threads.length) {
      break;
    }

    stats += threads.length;
    cursor = messages.at(messages.length - 1)?.updatedAt!;

    await mapAndPersist(threads, searchSettings, logger);
  } while (true);
  logger.log({ syncUpdatedThreads: stats });
}
