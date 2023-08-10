import { client } from './client';
import { prisma } from '@linen/database';
import { serializer } from './serializer';
import { serializeThread } from '@linen/serializers/thread';
import type { Logger, SerializedSearchSettings } from '@linen/types';

export async function dump({
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

  if (!account.searchSettings) {
    throw new Error(`missing searchSettings: ${accountId}`);
  }

  const searchSettings: SerializedSearchSettings = JSON.parse(
    account.searchSettings
  );

  let cursor = 0;
  do {
    const threads = await prisma.threads.findMany({
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
        incrementId: { gt: cursor },
        hidden: false,
        messageCount: { gt: 0 },
      },
      orderBy: { incrementId: 'asc' },
      take: 300,
    });

    if (!threads.length) {
      break;
    }

    cursor = threads.at(threads.length - 1)?.incrementId!;

    const documents = threads.map((t) => serializer(serializeThread(t)));

    await client
      .collections(searchSettings.indexName)
      .documents()
      .import(documents, { action: 'upsert' })
      .catch((error: any) => {
        logger.error(
          error.importResults.filter((result: any) => !result.success)
        );
      });
  } while (true);

  // set cursor for next sync job
  searchSettings.lastSync = new Date().getTime();
  // persist
  await prisma.accounts.update({
    where: { id: accountId },
    data: {
      searchSettings: JSON.stringify(searchSettings),
    },
  });
}
