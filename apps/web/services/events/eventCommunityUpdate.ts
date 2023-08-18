import { createTypesenseCommunityTypeUpdate } from 'queue/jobs';

export async function eventCommunityUpdate({
  id,
  isTypeChanged,
}: {
  id: string;
  isTypeChanged: boolean;
}) {
  const jobs = [];

  if (isTypeChanged) {
    jobs.push(createTypesenseCommunityTypeUpdate({ accountId: id }));
  }

  await Promise.allSettled(jobs);
}
