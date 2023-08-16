import { client } from './client';

const week = 604800;
const expiresAt = () => Math.floor(new Date().getTime() / 1000.0) + week;

function createKey({
  keyWithSearchPermissions,
  filter_by,
}: {
  keyWithSearchPermissions: string;
  filter_by: string;
}) {
  const expires_at = expiresAt();
  const value = client
    .keys()
    .generateScopedSearchKey(keyWithSearchPermissions, {
      filter_by,
      expires_at,
    });
  return { value, expires_at };
}

export function createFeedKey({
  keyWithSearchPermissions,
}: {
  keyWithSearchPermissions: string;
}) {
  return createKey({
    keyWithSearchPermissions,
    filter_by: `is_restrict:=false && is_public:=true`,
  });
}

export function createUserKey({
  keyWithSearchPermissions,
  accountId,
  userId,
}: {
  keyWithSearchPermissions: string;
  accountId: string;
  userId: string;
}) {
  return createKey({
    keyWithSearchPermissions,
    filter_by: `accountId:=${accountId} && (is_public:=true || accessible_to:=${userId})`,
  });
}

export function createAccountKey({
  keyWithSearchPermissions,
  accountId,
}: {
  keyWithSearchPermissions: string;
  accountId: string;
}) {
  return createKey({
    keyWithSearchPermissions,
    filter_by: `accountId:=${accountId} && is_public:=true`,
  });
}

export async function createReadOnly() {
  return await client.keys().create({
    description: `read-only`,
    actions: [
      'collections:get',
      'collections:list',
      'documents:search',
      'documents:get',
      'aliases:list',
      'aliases:get',
      'synonyms:list',
      'synonyms:get',
      'overrides:list',
      'overrides:get',
      'metrics.json:list',
    ],
    collections: ['*'],
  });
}

export async function createSearchOnlyKey(collectionName: string) {
  const key = await client.keys().create({
    description: `Search-only`,
    actions: ['documents:search'],
    collections: [collectionName],
  });

  if (!key.value || !key.expires_at) {
    throw new Error('failed to create api key');
  }
  return key;
}
