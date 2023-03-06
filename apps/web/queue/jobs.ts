import {
  emailNotificationPayloadType,
  notificationListenerType,
} from 'services/notifications';
import type { SyncJobType } from 'services/sync';
import type { SlackEvent } from 'types/slackResponses/slackMessageEventInterface';
import { makeWorkerUtils, type WorkerUtils } from 'graphile-worker';
import { downloadCert, getDatabaseUrl } from '@linen/database';
import { TwoWaySyncType } from './tasks/two-way-sync';

let instance: WorkerUtils | undefined;
class WorkerSingleton {
  private static async createInstance() {
    await downloadCert();
    return makeWorkerUtils({
      connectionString: getDatabaseUrl({
        dbUrl: process.env.DATABASE_URL,
        cert: process.env.RDS_CERTIFICATE,
      }),
    });
  }
  static async getInstance() {
    if (!instance) {
      instance = await this.createInstance();
    }
    return instance;
  }
}

export const QUEUE_1_NEW_EVENT = 'notification-new-event';
export const QUEUE_2_SEND_EMAIL = 'notification-send-email';

export const QUEUE_REMIND_ME_LATER = 'remind-me-later-queue';
export const QUEUE_MARK_ALL_AS_READ = 'mark-all-as-read-queue';
export const QUEUE_MAINTENANCE_SLUGIFY = 'slugify';
export const QUEUE_MAINTENANCE_MESSAGE_COUNT = 'update-message-count';
export const QUEUE_CRAWL_GOOGLE_STATS = 'google-stats';
export const QUEUE_SITEMAP = 'sitemap';

export async function createWebhookJob(payload: SlackEvent) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob('webhook', payload, {
    jobKey: `webhook:${payload.event_id}`,
    maxAttempts: 1,
  });
}

export async function createSyncJob(payload: SyncJobType) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob('sync', payload, {
    jobKey: `sync:${payload.account_id}`,
    maxAttempts: 1,
  });
}

export async function createMailingJob(
  jobKey: string,
  runAt: Date,
  payload: emailNotificationPayloadType
) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob(QUEUE_2_SEND_EMAIL, payload, {
    jobKey: `${QUEUE_2_SEND_EMAIL}:${jobKey}`,
    maxAttempts: 1,
    runAt,
    jobKeyMode: 'preserve_run_at',
  });
}

export async function createRemindMeJob(
  jobKey: string,
  runAt: Date,
  payload: any
) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob(QUEUE_REMIND_ME_LATER, payload, {
    jobKey: `${QUEUE_REMIND_ME_LATER}:${jobKey}`,
    maxAttempts: 1,
    runAt,
    jobKeyMode: 'replace',
  });
}

export async function createMarkAllAsReadJob(
  jobKey: string,
  payload: { userId: string }
) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob(QUEUE_MARK_ALL_AS_READ, payload, {
    jobKey: `${QUEUE_MARK_ALL_AS_READ}:${jobKey}`,
    maxAttempts: 1,
    jobKeyMode: 'replace',
  });
}

export async function createNewEventJob(
  jobKey: string,
  payload: notificationListenerType
) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob(QUEUE_1_NEW_EVENT, payload, {
    jobKey: `${QUEUE_1_NEW_EVENT}:${jobKey}`,
    maxAttempts: 1,
  });
}

export async function createTwoWaySyncJob(payload: TwoWaySyncType) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob('two-way-sync', payload, {
    maxAttempts: 1,
  });
}
