import { createSyncJob } from 'queue/jobs';
import { SyncJobType } from '@linen/types';

export type NewMessageEvent = {
  accountId: string;
};

export async function eventNewIntegration(event: NewMessageEvent) {
  const syncJob: SyncJobType = {
    account_id: event.accountId,
  };

  const promises: Promise<any>[] = [
    // it should dispatch messages to our queue system
    createSyncJob(syncJob),
  ];

  await Promise.allSettled(promises);
}
