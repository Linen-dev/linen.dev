import { createChatSyncJob } from 'queue/jobs';
import type { ChatSyncJobType } from 'services/sync';

type NewMessageEvent = ChatSyncJobType;

export async function eventNewMessage({
  channelId,
  messageId,
  threadId,
}: NewMessageEvent) {
  const promises: Promise<any>[] = [
    createChatSyncJob({ channelId, messageId, threadId, reply: true }),
  ];

  await Promise.allSettled(promises);
  // .then((results) =>
  //   results.forEach((result) => console.log(result.status))
  // );
}
