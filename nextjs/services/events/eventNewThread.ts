import { createChatSyncJob } from 'queue/jobs';
import type { ChatSyncJobType } from 'services/sync';

type NewThreadEvent = ChatSyncJobType;

export async function eventNewThread({
  channelId,
  messageId,
  threadId,
}: NewThreadEvent) {
  const promises: Promise<any>[] = [
    createChatSyncJob({ channelId, messageId, threadId, thread: true }),
  ];

  await Promise.allSettled(promises);
  //   .then((results) =>
  //     results.forEach((result) => console.log(result.status))
  //   );
}
