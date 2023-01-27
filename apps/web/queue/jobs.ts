import type { SyncJobType } from 'services/sync';
import type { SlackEvent } from 'types/slackResponses/slackMessageEventInterface';
import WorkerSingleton from './singleton';
export { createTwoWaySyncJob } from './tasks/two-way-sync';

export async function createWebhookJob(payload: SlackEvent) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob('webhook', payload, {
    jobKey: `webhook:${payload.event_id}`,
    maxAttempts: 2,
  });
}

export async function createSyncJob(payload: SyncJobType) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob('sync', payload, {
    jobKey: `sync:${payload.account_id}`,
    maxAttempts: 2,
  });
}
