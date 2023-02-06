import { downloadCert, getDatabaseUrl } from '@linen/database';
import { run } from 'graphile-worker';
import { emailNotificationTask } from './tasks/email-notification-sender';
import { processNewEventTask } from './tasks/email-notification-event';
import { reminderMeLaterTask } from './tasks/remind-me-later';
import { twoWaySync } from './tasks/two-way-sync';
import { sync } from './tasks/sync';
import { webhook } from './tasks/webhook';
import {
  QUEUE_1_NEW_EVENT,
  QUEUE_2_SEND_EMAIL,
  QUEUE_REMIND_ME_LATER,
} from './jobs';

async function runWorker() {
  await downloadCert();
  const runner = await run({
    connectionString: getDatabaseUrl({
      dbUrl: process.env.DATABASE_URL,
      cert: process.env.RDS_CERTIFICATE,
    }),
    concurrency: 5,
    noHandleSignals: false,
    pollInterval: 1000,
    taskList: {
      [QUEUE_1_NEW_EVENT]: processNewEventTask as any,
      [QUEUE_2_SEND_EMAIL]: emailNotificationTask as any,
      [QUEUE_REMIND_ME_LATER]: reminderMeLaterTask as any,
      ['two-way-sync']: twoWaySync,
      ['sync']: sync,
      ['webhook']: webhook,
    },
  });
  await runner.promise;
}

runWorker().catch((err) => {
  console.error(err);
  process.exit(1);
});
