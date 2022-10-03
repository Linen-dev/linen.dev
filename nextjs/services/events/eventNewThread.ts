import { createChatSyncJob } from 'queue/jobs';
import { push, pushChannel } from 'services/push';

type NewThreadEvent = {
  channelId: any;
  threadId: any;
  messageId: any;
  imitationId: string;
};

export async function eventNewThread({
  channelId,
  messageId,
  threadId,
  imitationId,
}: NewThreadEvent) {
  const event = {
    channelId,
    messageId,
    threadId,
    imitationId,
    isThread: true,
    isReply: false,
  };

  const promises: Promise<any>[] = [
    createChatSyncJob(event),
    push(event),
    pushChannel(event),
  ];

  await Promise.allSettled(promises);
}
