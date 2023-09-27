import { AnonymizeType, Logger } from '@linen/types';
import {
  getAccountSettings,
  pushToTypesense,
  queryThreads,
} from './utils/shared';

export async function handleMessageCreation({
  threadId,
  accountId,
  logger,
}: {
  threadId: string;
  accountId: string;
  logger: Logger;
}) {
  const accountSettings = await getAccountSettings(accountId, logger);
  if (!accountSettings) return;

  const threads = await queryThreads({
    where: {
      id: threadId,
    },
  });

  await pushToTypesense({
    threads,
    is_restrict: accountSettings.searchSettings.scope === 'private',
    logger,
    anonymize: accountSettings.account.anonymizeUsers
      ? (accountSettings.account.anonymize as AnonymizeType)
      : undefined,
  });
}
