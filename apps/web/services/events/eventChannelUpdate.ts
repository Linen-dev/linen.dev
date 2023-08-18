import {
  createTypesenseChannelTypeUpdate,
  createTypesenseChannelNameUpdate,
} from 'queue/jobs';

export async function eventChannelUpdate({
  channelId,
  isNameChanged,
  isTypeChanged,
}: {
  channelId: string;
  isTypeChanged: boolean;
  isNameChanged: boolean;
}) {
  const jobs: Promise<any>[] = [];

  if (isNameChanged) {
    jobs.push(createTypesenseChannelNameUpdate({ channelId }));
  }

  if (isTypeChanged) {
    jobs.push(createTypesenseChannelTypeUpdate({ channelId }));
  }

  await Promise.allSettled(jobs);
}
