import { mentions } from '@prisma/client';
import { createChatSyncJob } from 'queue/jobs';
import { push, pushChannel } from 'services/push';
import { eventNewMentions } from './eventNewMentions';

type NewThreadEvent = {
  channelId: any;
  threadId: any;
  messageId: any;
  imitationId: string;
  mentions: mentions[];
};

export async function eventNewThread({
  channelId,
  messageId,
  threadId,
  imitationId,
  mentions = [],
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
    eventNewMentions({ mentions, channelId, threadId }),
  ];

  await Promise.allSettled(promises);
}
