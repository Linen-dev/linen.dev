import type { mentions, users } from '@linen/database';
import { MentionNode } from '@linen/types';
import { createTwoWaySyncJob } from 'queue/jobs';

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
