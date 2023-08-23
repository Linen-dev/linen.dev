import type { Logger } from '@linen/types';
import {
  getAccountSettings,
  pushToTypesense,
  queryThreads,
} from './utils/shared';
import { client } from './utils/client';
import { collectionSchema } from './utils/model';

export async function deletion({
  accountId,
  threadId,
  logger,
}: {
  accountId: string;
  threadId: string;
  logger: Logger;
}) {
  const { searchSettings } = await getAccountSettings(accountId);

  const threads = await queryThreads({
    where: {
      id: threadId,
    },
  });

  if (threads.length) {
    // upsert
    await pushToTypesense({
      threads,
      is_restrict: searchSettings.scope === 'private',
      logger,
    });
  } else {
    // delete
    try {
      await client
        .collections(collectionSchema.name)
        .documents(threadId)
        .delete();
    } catch (error: any) {
      if (error.name === 'ObjectNotFound' || error.httpStatus === 404) {
        logger.error({ error });
      } else {
        throw error;
      }
    }
  }
}
