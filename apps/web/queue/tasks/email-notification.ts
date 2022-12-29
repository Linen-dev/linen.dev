import { run, type JobHelpers } from 'graphile-worker';
import { downloadCert } from 'utilities/database';
import settings from 'queue/settings';
import WorkerSingleton from 'queue/singleton';
import {
  emailNotificationPayloadType,
  handleNewEvent,
  notificationListenerType,
  sendEmailNotificationTask,
} from 'services/notifications';

const QUEUE_1_NEW_EVENT = 'notification-new-event';
const QUEUE_2_SEND_EMAIL = 'notification-send-email';

async function emailNotificationTask(
  payload: emailNotificationPayloadType,
  helpers: JobHelpers
): Promise<any> {
  helpers.logger.info(JSON.stringify(helpers.job));
  const result = await sendEmailNotificationTask({
    ...payload,
    locked_at: helpers.job.locked_at,
  });
  helpers.logger.info(JSON.stringify(result));
}

async function processNewEventTask(
  payload: notificationListenerType,
  helpers: JobHelpers
): Promise<any> {
  helpers.logger.info(JSON.stringify(helpers.job));
  const result = await handleNewEvent(payload);
  helpers.logger.info(JSON.stringify(result));
}

export async function runWorker() {
  await downloadCert();
  const runner = await run({
    ...settings,
    taskList: {
      [QUEUE_1_NEW_EVENT]: processNewEventTask as any,
      [QUEUE_2_SEND_EMAIL]: emailNotificationTask as any,
    },
  });
  await runner.promise;
}

export async function createMailingJob(
  jobKey: string,
  runAt: Date,
  payload: emailNotificationPayloadType
) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob(QUEUE_2_SEND_EMAIL, payload, {
    jobKey,
    maxAttempts: 1,
    runAt,
    jobKeyMode: 'preserve_run_at',
  });
}

export async function createNewEventJob(
  jobKey: string,
  payload: notificationListenerType
) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob(QUEUE_1_NEW_EVENT, payload, {
    jobKey,
    maxAttempts: 1,
  });
}
