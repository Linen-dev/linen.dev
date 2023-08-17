import { prisma } from '@linen/database';
import { SerializedSearchSettings } from '@linen/types';
import { tc } from '@linen/utilities/tc';
import {
  createAccountKeyAndPersist,
  createUserKeyAndPersist,
} from './utils/shared';

export async function refreshApiKeys() {
  const now = Math.floor(new Date().getTime() / 1000.0);
  const day = 86400;

  const accounts = await prisma.accounts.findMany({
    where: { searchSettings: { not: null } },
  });

  for (const account of accounts) {
    const settings: SerializedSearchSettings = tc(() =>
      JSON.parse(account.searchSettings!)
    );
    if ((settings?.apiKeyExpiresAt || 0) < now + day) {
      await createAccountKeyAndPersist({ account });
    }

    const isPublic = account.type === 'PUBLIC';

    const users = await prisma.users.findMany({
      where: { accountsId: account.id, authsId: { not: null } },
    });

    for (const user of users) {
      const userSettings: SerializedSearchSettings = tc(() =>
        JSON.parse(user.searchSettings!)
      );
      if ((userSettings?.apiKeyExpiresAt || 0) < now + day) {
        await createUserKeyAndPersist({ account, user, isPublic });
      }
    }
  }
}
