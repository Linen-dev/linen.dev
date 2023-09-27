import type { mentions, users } from '@linen/database';
import { MentionNode } from '@linen/types';
import { createTwoWaySyncJob, createTypesenseOnThreadUpdate } from 'queue/jobs';
import AccountsService from 'services/accounts';

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

  const account = await AccountsService.getAccountByThreadId(threadId);
  if (!!account?.searchSettings && threadId) {
    promises.push(
      createTypesenseOnThreadUpdate({
        threadId,
        accountId: account.id,
      })
    );
  }

  await Promise.allSettled(promises);
}
