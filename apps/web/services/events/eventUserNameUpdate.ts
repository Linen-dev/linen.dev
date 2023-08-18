import { createTypesenseUserNameUpdate } from 'queue/jobs';

export async function eventUserNameUpdate({
  userId,
  accountId,
}: {
  userId: string;
  accountId: string;
}) {
  await Promise.allSettled([
    createTypesenseUserNameUpdate({ accountId, userId }),
  ]);
}
