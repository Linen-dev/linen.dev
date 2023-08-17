import { prisma } from '@linen/database';
import type { Logger } from '@linen/types';
import {
  createAccountKeyAndPersist,
  createUserKeyAndPersist,
} from './utils/shared';

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

  await createAccountKeyAndPersist({ account });

  const isPublic = account.type === 'PUBLIC';

  const users = await prisma.users.findMany({
    where: { accountsId: account.id, authsId: { not: null } },
  });

  for (const user of users) {
    await createUserKeyAndPersist({ account, user, isPublic });
  }
}
