import { mentions } from '@prisma/client';
import { createChatSyncJob } from 'queue/jobs';
import { push, pushChannel } from 'services/push';
import { eventNewMentions } from './eventNewMentions';

type NewMessageEvent = {
  channelId: any;
  threadId: any;
  messageId: any;
  imitationId: string;
  mentions: mentions[];
};

export async function eventNewMessage({
  channelId,
  messageId,
  threadId,
  imitationId,
  mentions = [],
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
    eventNewMentions({ mentions, channelId, threadId }),
  ];

  await Promise.allSettled(promises);
}
