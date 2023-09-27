import { createTypesenseOnMessageUpdate } from 'queue/jobs';
import AccountsService from 'services/accounts';

export type MessageUpdateEvent = {
  channelId: string;
  threadId: string | null;
  messageId: string;
};

export async function eventMessageUpdated({ threadId }: MessageUpdateEvent) {
  const promises: Promise<any>[] = [];

  if (threadId) {
    const account = await AccountsService.getAccountByThreadId(threadId);
    if (!!account?.searchSettings) {
      promises.push(
        createTypesenseOnMessageUpdate({
          threadId,
          accountId: account.id,
        })
      );
    }
  }

  await Promise.allSettled(promises);
}
