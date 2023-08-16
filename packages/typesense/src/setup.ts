import { cleanEnv, str } from 'envalid';
import { prisma } from '@linen/database';
import type { Logger, SerializedSearchSettings } from '@linen/types';
import { createAccountKey, createUserKey } from './utils/keys';
import { collectionSchema } from './utils/model';

const env = cleanEnv(process.env, {
  TYPESENSE_SEARCH_ONLY: str(),
});

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
        accountId,
      })
    : undefined;

  const settings: SerializedSearchSettings = {
    engine: 'typesense',
    scope: isPublic ? 'public' : 'private',
    apiKey: key?.value || 'private',
    apiKeyExpiresAt: key?.expires_at,
  };

  await prisma.accounts.update({
    where: {
      id: accountId,
    },
    data: {
      searchSettings: JSON.stringify(settings),
    },
  });

  const users = await prisma.users.findMany({
    where: { accountsId: accountId, authsId: { not: null } },
  });

  for (const user of users) {
    const key = createUserKey({
      keyWithSearchPermissions: env.TYPESENSE_SEARCH_ONLY,
      accountId,
      userId: user.id,
    });
    const settings: SerializedSearchSettings = {
      apiKey: key.value,
      apiKeyExpiresAt: key.expires_at,
      engine: 'typesense',
      scope: isPublic ? 'public' : 'private',
    };
    await prisma.users.update({
      where: {
        id: user.id,
      },
      data: {
        searchSettings: JSON.stringify(settings),
      },
    });
  }
}
