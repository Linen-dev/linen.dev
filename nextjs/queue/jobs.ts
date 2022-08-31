import { SlackEvent } from 'types/slackResponses/slackMessageEventInterface';
import WorkerSingleton from './singleton';

export async function createWebhookJob(payload: SlackEvent) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob('webhook', payload, { jobKey: payload.event_id });
}
