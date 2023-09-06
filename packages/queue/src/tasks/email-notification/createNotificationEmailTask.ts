import { JobHelpers } from 'graphile-worker';
import { emailNotificationPayloadType } from '@linen/types';

export async function createNotificationEmailTask({
  jobKey,
  runAt,
  payload,
  helpers,
}: {
  jobKey: string;
  runAt: Date;
  payload: emailNotificationPayloadType;
  helpers: JobHelpers;
}) {
  return await helpers.addJob('notificationEmailTask', payload, {
    jobKey: `notificationEmailTask:${jobKey}`,
    maxAttempts: 1,
    runAt,
    jobKeyMode: 'preserve_run_at',
  });
}
