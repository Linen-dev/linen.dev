import { mentions } from '@prisma/client';
import { createChatSyncJob } from 'queue/jobs';
import { push, pushChannel, pushCommunity } from 'services/push';
import { eventNewMentions } from './eventNewMentions';

type MentionNode = {
  type: string;
  id: string;
  source: string;
};

type NewMessageEvent = {
  channelId: any;
  threadId: any;
  messageId: any;
  imitationId: string;
  mentions: mentions[];
  mentionNodes: MentionNode[];
  communityId: string;
};

export async function eventNewMessage({
  channelId,
  messageId,
  threadId,
  imitationId,
  mentions = [],
  mentionNodes = [],
  communityId,
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
    pushCommunity({ ...event, communityId }),
    eventNewMentions({ mentions, mentionNodes, channelId, threadId }),
  ];

  await Promise.allSettled(promises);
}
