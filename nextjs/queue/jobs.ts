import type { SyncJobType, ChatSyncJobType } from 'services/sync';
import type { SlackEvent } from 'types/slackResponses/slackMessageEventInterface';
import WorkerSingleton from './singleton';

export async function createWebhookJob(payload: SlackEvent) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob('webhook', payload, {
    jobKey: payload.event_id,
    maxAttempts: 2,
  });
}

export async function createSyncJob(payload: SyncJobType) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob('sync', payload, {
    jobKey: payload.account_id,
    maxAttempts: 2,
  });
}

export async function createChatSyncJob(payload: ChatSyncJobType) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob('chat-sync', payload, {
    jobKey: payload.messageId,
    maxAttempts: 2,
  });
}
