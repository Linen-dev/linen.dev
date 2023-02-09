import { createTwoWaySyncJob } from 'queue/jobs';
import { stringify } from 'superjson';

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

  const result = await Promise.allSettled(promises);
  console.log(stringify(result));
}
