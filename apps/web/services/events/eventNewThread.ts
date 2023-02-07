import type { mentions, users } from '@linen/database';
import { createTwoWaySyncJob } from 'queue/jobs';
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
    createTwoWaySyncJob({ ...event, event: 'newThread', id: messageId }),
    push(event),
    pushChannel(event),
    pushCommunity({ ...event, communityId }),
    eventNewMentions({ mentions, mentionNodes, channelId, threadId }),
    notificationListener({ ...event, communityId, mentions }),
  ];

  const result = await Promise.allSettled(promises);
  console.log(JSON.stringify(result));
}
