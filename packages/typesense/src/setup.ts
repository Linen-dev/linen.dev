import { prisma } from '@linen/database';
import type { Logger, SerializedSearchSettings } from '@linen/types';
import { client } from './client';
import { collectionFactory } from './model';

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

  const schema = collectionFactory(accountId);

  const collection = await client
    .collections(schema.name)
    .retrieve()
    .catch(() => {});

  if (collection) {
    throw new Error(`collection already setup: ${accountId}`);
  }

  try {
    await client.collections().create(schema);
  } catch (error) {
    logger.error({ error });
    throw new Error('failed to create collection');
  }

  const key = await client.keys().create({
    description: `Search-only ${accountId}`,
    actions: ['documents:search'],
    collections: [schema.name],
  });

  if (!key.value || !key.expires_at) {
    throw new Error('failed to create api key');
  }

  const settings: SerializedSearchSettings = {
    engine: 'typesense',
    scope: 'public',
    indexName: schema.name,
    apiKey: key.value,
    apiKeyExpiresAt: key.expires_at,
    apiKeyId: key.id,
  };

  await prisma.accounts.update({
    where: {
      id: accountId,
    },
    data: {
      searchSettings: JSON.stringify(settings),
    },
  });
}
