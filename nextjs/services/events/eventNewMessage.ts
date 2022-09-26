import { createChatSyncJob } from 'queue/jobs';
import { push } from 'services/push';
import type { ChatSyncJobType } from 'services/sync';
import type { SerializedMessage } from 'serializers/message';

type NewMessageEvent = ChatSyncJobType & {
  imitationId: string;
  message: SerializedMessage;
};

export async function eventNewMessage({
  channelId,
  messageId,
  threadId,
  imitationId,
  message,
}: NewMessageEvent) {
  const promises: Promise<any>[] = [
    createChatSyncJob({ channelId, messageId, threadId, reply: true }),
    push({
      channelId,
      body: {
        message,
        threadId,
        imitationId,
      },
    }),
  ];

  await Promise.allSettled(promises);
}
