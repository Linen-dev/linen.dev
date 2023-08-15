import { prisma } from '@linen/database';
import type { Logger } from '@linen/types';
import { getAccountSettings, getQuery, mapAndPersist } from './shared';
import { client } from './client';

export async function deletion({
  accountId,
  threadId,
  logger,
}: {
  accountId: string;
  threadId: string;
  logger: Logger;
}) {
  const searchSettings = await getAccountSettings(accountId);
  const defaultQuery = getQuery(accountId);

  const thread = await prisma.threads.findFirst({
    include: defaultQuery.include,
    where: {
      id: threadId,
    },
  });

  if (thread) {
    // upsert
    await mapAndPersist([thread], searchSettings, logger);
  } else {
    // delete
    await client
      .collections(searchSettings.indexName)
      .documents(threadId)
      .delete();
  }
}
