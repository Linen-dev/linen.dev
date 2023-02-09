import { createTwoWaySyncJob } from 'queue/jobs';
import { stringify } from 'superjson';

type ThreadReopenedEvent = {
  channelId: string;
  threadId: string;
  accountId: string;
};

export async function eventThreadReopened({
  channelId,
  threadId,
  accountId,
}: ThreadReopenedEvent) {
  const event = {
    channelId,
    threadId,
    accountId,
  };

  const promises: Promise<any>[] = [
    createTwoWaySyncJob({ ...event, event: 'threadReopened', id: threadId }),
  ];

  const result = await Promise.allSettled(promises);
  console.log(stringify(result));
}
