import type {
  AnonymizeType,
  Logger,
  SerializedSearchSettings,
} from '@linen/types';
import {
  getAccountSettings,
  persistEndFlag,
  pushToTypesense,
  queryThreads,
  threadsWhere,
} from './utils/shared';
import { accounts, prisma } from '@linen/database';

export async function sync({
  accountId,
  logger,
}: {
  accountId: string;
  logger: Logger;
}) {
  const accountSettings = await getAccountSettings(accountId, logger);
  if (!accountSettings) return;
  await syncUpdatedThreads(
    accountSettings.searchSettings,
    accountSettings.account,
    logger
  );

  // set cursor for next sync job
  await persistEndFlag(accountSettings.searchSettings, accountId);
}

async function syncUpdatedThreads(
  searchSettings: SerializedSearchSettings,
  account: accounts,
  logger: Logger
) {
  let cursor = new Date(searchSettings.lastSync || 0);
  let stats = 0;
  do {
    const messages = await prisma.messages.findMany({
      select: { threadId: true, updatedAt: true },
      where: {
        threads: {
          ...threadsWhere({ accountId: account.id }),
        },
        updatedAt: { gt: cursor },
      },
      orderBy: { updatedAt: 'asc' },
      take: 10,
    });

    const threads = await queryThreads({
      where: {
        id: { in: [...new Set(messages.map((m) => m.threadId!))] },
      },
    });

    if (!threads.length) {
      break;
    }

    stats += threads.length;
    cursor = messages.at(messages.length - 1)?.updatedAt!;

    await pushToTypesense({
      threads,
      is_restrict: searchSettings.scope === 'private',
      logger,
      anonymize: account.anonymizeUsers
        ? (account.anonymize as AnonymizeType)
        : undefined,
    });
  } while (true);
  logger.log({ syncUpdatedThreads: stats });
}
