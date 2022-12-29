import type { mentions, users } from '@prisma/client';
import { createChatSyncJob } from 'queue/jobs';
import { push, pushChannel, pushCommunity } from 'services/push';
import { eventNewMentions } from './eventNewMentions';
import { notificationListener } from 'services/notifications';

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
  mentions: (mentions & {
    users: users | null;
  })[];
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
    notificationListener({ ...event, communityId, mentions }),
  ];

  await Promise.allSettled(promises);
}
