import type { mentions, users } from '@prisma/client';
import { createTwoWaySyncJob } from 'queue/jobs';
import { push, pushChannel, pushCommunity } from 'services/push';
import { eventNewMentions } from './eventNewMentions';

interface MentionNode {
  type: string;
  id: string;
  source: string;
}

type ThreadUpdatedEvent = {
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

export async function eventThreadUpdated({
  channelId,
  messageId,
  threadId,
  imitationId,
  mentions = [],
  mentionNodes = [],
  communityId,
  thread,
}: ThreadUpdatedEvent) {
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
    createTwoWaySyncJob({ ...event, event: 'threadUpdated', id: messageId }),
  ];

  await Promise.allSettled(promises);
}
