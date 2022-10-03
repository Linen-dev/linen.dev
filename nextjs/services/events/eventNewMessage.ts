import { createChatSyncJob } from 'queue/jobs';
import { push, pushChannel } from 'services/push';

type NewMessageEvent = {
  channelId: any;
  threadId: any;
  messageId: any;
  imitationId: string;
};

export async function eventNewMessage({
  channelId,
  messageId,
  threadId,
  imitationId,
}: NewMessageEvent) {
  const event = {
    channelId,
    messageId,
    threadId,
    imitationId,
    isThread: false,
    isReply: true,
  };

  const promises: Promise<any>[] = [
    createChatSyncJob(event),
    push(event),
    pushChannel(event),
  ];

  await Promise.allSettled(promises);
}
