import { prisma } from '@linen/database';
import type {
  AnonymizeType,
  Logger,
  SerializedSearchSettings,
} from '@linen/types';
import {
  createUserKeyAndPersist,
  persistEndFlag,
  pushToTypesense,
  queryThreads,
  threadsWhere,
} from './utils/shared';
import { createAccountKey } from './utils/keys';
import { env } from './utils/env';

export async function setup({
  accountId,
  logger,
}: {
  accountId: string;
  logger: Logger;
}) {
  const account = await prisma.accounts.findUnique({
    where: {
      id: accountId,
    },
  });

  if (!account) {
    throw new Error(`account not found: ${accountId}`);
  }

  const isPublic = account.type === 'PUBLIC';

  const key = isPublic
    ? createAccountKey({
        keyWithSearchPermissions: env.TYPESENSE_SEARCH_ONLY,
        accountId: account.id,
      })
    : undefined;

  const searchSettings: SerializedSearchSettings = {
    engine: 'typesense',
    scope: isPublic ? 'public' : 'private',
    apiKey: key?.value || 'private',
    apiKeyExpiresAt: key?.expires_at,
  };

  let cursor = 0;
  do {
    const threads = await queryThreads({
      where: {
        ...threadsWhere({ accountId }),
        incrementId: { gt: cursor },
      },
      orderBy: { incrementId: 'asc' },
      take: 50,
    });

    if (!threads.length) {
      break;
    }

    cursor = threads.at(threads.length - 1)?.incrementId!;

    await pushToTypesense({
      threads,
      is_restrict: searchSettings.scope === 'private',
      logger,
      anonymize: account.anonymizeUsers
        ? (account.anonymize as AnonymizeType)
        : undefined,
    });
  } while (true);

  // set cursor for next sync job
  await persistEndFlag(searchSettings, accountId);

  const users = await prisma.users.findMany({
    where: { accountsId: account.id, authsId: { not: null } },
  });

  for (const user of users) {
    await createUserKeyAndPersist({ account, user, isPublic });
  }
}
