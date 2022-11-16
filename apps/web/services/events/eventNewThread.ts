import { mentions } from '@prisma/client';
import { createChatSyncJob } from 'queue/jobs';
import { push, pushChannel, pushCommunity } from 'services/push';
import { eventNewMentions } from './eventNewMentions';

interface MentionNode {
  type: string;
  id: string;
  source: string;
}

type NewThreadEvent = {
  channelId: any;
  threadId: any;
  messageId: any;
  imitationId: string;
  mentions: mentions[];
  mentionNodes: MentionNode[];
  communityId: string;
  thread: string;
};

export async function eventNewThread({
  channelId,
  messageId,
  threadId,
  imitationId,
  mentions = [],
  mentionNodes = [],
  communityId,
  thread,
}: NewThreadEvent) {
  const event = {
    channelId,
    messageId,
    threadId,
    imitationId,
    isThread: true,
    isReply: false,
    thread,
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
