import { prisma } from '@linen/database';
import { deleteByQuery } from './utils/client';
import { collectionSchema } from './utils/model';

export async function handleCommunityDeletion({
  accountId,
}: {
  accountId: string;
}) {
  const account = await prisma.accounts.findUnique({
    where: { id: accountId },
  });

  if (!!account) {
    return `account not deleted: ${accountId}`;
  }

  await deleteByQuery({
    collection: collectionSchema.name,
    filter_by: `accountId:=${accountId}`,
  });
}
