import { accounts } from '@linen/database';
import { updateByQuery } from './utils/client';
import { collectionSchema } from './utils/model';
import { createAccountKeyAndPersist, getAccountSettings } from './utils/shared';
import { Logger } from '@linen/types';

export async function handleCommunityUpdate({
  accountId,
  logger,
}: {
  accountId: string;
  logger: Logger;
}) {
  const accountSettings = await getAccountSettings(accountId, logger);
  if (!accountSettings) {
    return;
  }

  if (
    accountSettings.account.type.toLowerCase() ===
    accountSettings.searchSettings.scope
  ) {
    // nothing to update
    return;
  }

  // went from public to private
  if (
    accountSettings.account.type === 'PRIVATE' &&
    accountSettings.searchSettings.scope === 'public'
  ) {
    // set threads as is_restrict=true and remove anonymous api-key
    await updateThreadsAndRecreateKeys(accountSettings.account, {
      is_restrict: true,
    });
    return;
  }

  // went from private to public
  if (
    accountSettings.account.type === 'PUBLIC' &&
    accountSettings.searchSettings.scope === 'private'
  ) {
    // set threads as is_restrict=false and create anonymous api-key
    await updateThreadsAndRecreateKeys(accountSettings.account, {
      is_restrict: false,
    });
    return;
  }
}

async function updateThreadsAndRecreateKeys(
  account: accounts,
  document: object
) {
  await updateByQuery({
    collection: collectionSchema.name,
    filter_by: `accountId:=${account.id}`,
    document,
  });
  await createAccountKeyAndPersist({ account });
}
