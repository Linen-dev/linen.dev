import { createChatSyncJob } from 'queue/jobs';
import { push } from 'services/push';
import type { SerializedThread } from 'serializers/thread';

type NewThreadEvent = {
  channelId: any;
  threadId: any;
  messageId: any;
  thread: SerializedThread;
  imitationId: string;
};

export async function eventNewThread({
  channelId,
  messageId,
  threadId,
  imitationId,
  thread,
}: NewThreadEvent) {
  const promises: Promise<any>[] = [
    createChatSyncJob({ channelId, messageId, threadId, thread: true }),
    push({
      channelId: channelId,
      body: {
        thread,
        imitationId,
      },
    }),
  ];

  await Promise.allSettled(promises);
}
