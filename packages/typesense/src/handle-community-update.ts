import { accounts } from '@linen/database';
import { updateByQuery } from './utils/client';
import { collectionSchema } from './utils/model';
import { createAccountKeyAndPersist, getAccountSettings } from './utils/shared';

export async function handleCommunityUpdate({
  accountId,
}: {
  accountId: string;
}) {
  const { searchSettings, account } = await getAccountSettings(accountId);

  if (account.type.toLowerCase() === searchSettings.scope) {
    // nothing to update
    return;
  }

  // went from public to private
  if (account.type === 'PRIVATE' && searchSettings.scope === 'public') {
    // set threads as is_restrict=true and remove anonymous api-key
    await updateThreadsAndRecreateKeys(account, {
      is_restrict: true,
    });
    return;
  }

  // went from private to public
  if (account.type === 'PUBLIC' && searchSettings.scope === 'private') {
    // set threads as is_restrict=false and create anonymous api-key
    await updateThreadsAndRecreateKeys(account, {
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
