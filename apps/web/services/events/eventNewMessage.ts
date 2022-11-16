import { mentions } from '@prisma/client';
import { createChatSyncJob } from 'queue/jobs';
import { push, pushChannel, pushCommunity } from 'services/push';
import { updateMetrics } from 'services/threads';
import { eventNewMentions } from './eventNewMentions';

type MentionNode = {
  type: string;
  id: string;
  source: string;
};

export type NewMessageEvent = {
  channelId: any;
  threadId: any;
  messageId: any;
  imitationId: string;
  mentions: mentions[];
  mentionNodes: MentionNode[];
  communityId: string;
  message: string;
};

export async function eventNewMessage({
  channelId,
  messageId,
  threadId,
  imitationId,
  mentions = [],
  mentionNodes = [],
  communityId,
  message,
}: NewMessageEvent) {
  const event = {
    channelId,
    messageId,
    threadId,
    imitationId,
    isThread: false,
    isReply: true,
    message,
  };

  const promises: Promise<any>[] = [
    createChatSyncJob(event),
    push(event),
    pushChannel(event),
    updateMetrics({ messageId, threadId }),
    pushCommunity({ ...event, communityId }),
    eventNewMentions({ mentions, mentionNodes, channelId, threadId }),
  ];

  await Promise.allSettled(promises);
}
