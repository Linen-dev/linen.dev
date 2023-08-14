import { Prisma, prisma, threads } from '@linen/database';
import { Logger, SerializedSearchSettings } from '@linen/types';
import { client } from './client';
import { serializer } from './serializer';
import { serializeThread } from '@linen/serializers/thread';

export async function getAccountSettings(accountId: string) {
  const account = await prisma.accounts.findUnique({
    where: {
      id: accountId,
    },
  });

  if (!account) {
    throw new Error(`account not found: ${accountId}`);
  }

  if (!account.searchSettings) {
    throw new Error(`missing searchSettings: ${accountId}`);
  }

  const searchSettings: SerializedSearchSettings = JSON.parse(
    account.searchSettings
  );
  return searchSettings;
}

export function getQuery(accountId: string): Prisma.threadsFindManyArgs {
  return {
    include: {
      messages: {
        include: {
          author: true,
          mentions: {
            include: {
              users: true,
            },
          },
          reactions: true,
          attachments: true,
        },
        orderBy: { sentAt: 'asc' },
      },
      channel: true,
    },
    where: {
      channel: {
        account: { id: accountId },
        hidden: false,
        type: 'PUBLIC',
      },
      hidden: false,
      messageCount: { gt: 0 },
    },
    orderBy: { incrementId: 'asc' },
    take: 300,
  };
}

/** persist timestamp as flag for next sync job */
export async function persistEndFlag(
  searchSettings: SerializedSearchSettings,
  accountId: string
) {
  searchSettings.lastSync = new Date().getTime();
  // persist
  await prisma.accounts.update({
    where: { id: accountId },
    data: {
      searchSettings: JSON.stringify(searchSettings),
    },
  });
}

/** serialize threads and send it to typesense datastore */
export async function mapAndPersist(
  threads: threads[],
  searchSettings: SerializedSearchSettings,
  logger: Logger
) {
  const documents = threads.map((t) => serializer(serializeThread(t)));

  await client
    .collections(searchSettings.indexName)
    .documents()
    .import(documents, { action: 'upsert' })
    .catch((error: any) => {
      logger.error(
        error.importResults
          .filter((result: any) => !result.success)
          .map((result: any) => result.error)
      );
    });
}
