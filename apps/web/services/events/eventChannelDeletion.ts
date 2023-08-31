import { createTypesenseChannelDeletion } from 'queue/jobs';

export async function eventChannelDeletion({
  channelId,
  accountId,
  channelName,
}: {
  channelId: string;
  accountId: string;
  channelName: string;
}) {
  const jobs: Promise<any>[] = [
    createTypesenseChannelDeletion({ channelId, accountId, channelName }),
  ];

  await Promise.allSettled(jobs);
}
