import { createTwoWaySyncJob } from 'queue/jobs';

type ThreadClosedEvent = {
  channelId: string;
  threadId: string;
  accountId: string;
};

export async function eventThreadClosed({
  channelId,
  threadId,
  accountId,
}: ThreadClosedEvent) {
  const event = {
    channelId,
    threadId,
    accountId,
  };

  const promises: Promise<any>[] = [
    createTwoWaySyncJob({ ...event, event: 'threadClosed', id: threadId }),
  ];

  await Promise.allSettled(promises);
}
