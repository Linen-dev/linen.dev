import { downloadCert, getDatabaseUrl } from '@linen/database';
import { run, parseCronItems } from 'graphile-worker';
import { emailNotificationTask } from './tasks/email-notification-sender';
import { processNewEventTask } from './tasks/email-notification-event';
import { reminderMeLaterTask } from './tasks/remind-me-later';
import { markAllAsReadTask } from './tasks/mark-all-as-read';
import { twoWaySync } from './tasks/two-way-sync';
import { sync } from './tasks/sync';
import { webhook } from './tasks/webhook';
import { slugify } from './tasks/slugify';
import { updateMessagesCount } from './tasks/update-messages-count';
import { crawlGoogleResults } from './tasks/google-results';
import {
  QUEUE_1_NEW_EVENT,
  QUEUE_2_SEND_EMAIL,
  QUEUE_CRAWL_GOOGLE_STATS,
  QUEUE_MAINTENANCE_MESSAGE_COUNT,
  QUEUE_MAINTENANCE_SLUGIFY,
  QUEUE_REMIND_ME_LATER,
  QUEUE_MARK_ALL_AS_READ,
  QUEUE_SITEMAP,
} from './jobs';
import { sitemap } from './tasks/sitemap';

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
      [QUEUE_MARK_ALL_AS_READ]: markAllAsReadTask as any,
      ['two-way-sync']: twoWaySync,
      ['sync']: sync,
      ['webhook']: webhook,
      [QUEUE_MAINTENANCE_SLUGIFY]: slugify,
      [QUEUE_MAINTENANCE_MESSAGE_COUNT]: updateMessagesCount,
      [QUEUE_CRAWL_GOOGLE_STATS]: crawlGoogleResults,
      [QUEUE_SITEMAP]: sitemap,
    },
    parsedCronItems: parseCronItems([
      {
        pattern: '00 3 * * *',
        options: {
          queueName: QUEUE_MAINTENANCE_SLUGIFY,
          backfillPeriod: 0,
        },
        task: QUEUE_MAINTENANCE_SLUGIFY,
        identifier: QUEUE_MAINTENANCE_SLUGIFY,
      },
      {
        pattern: '00 3 * * *',
        options: {
          queueName: QUEUE_MAINTENANCE_MESSAGE_COUNT,
          backfillPeriod: 0,
        },
        task: QUEUE_MAINTENANCE_MESSAGE_COUNT,
        identifier: QUEUE_MAINTENANCE_MESSAGE_COUNT,
      },
      {
        pattern: '00 3 * * 1,5',
        options: {
          queueName: QUEUE_CRAWL_GOOGLE_STATS,
          backfillPeriod: 0,
        },
        task: QUEUE_CRAWL_GOOGLE_STATS,
        identifier: QUEUE_CRAWL_GOOGLE_STATS,
      },
      {
        pattern: '0 0 * * *',
        options: {
          queueName: QUEUE_SITEMAP,
          backfillPeriod: 0,
        },
        task: QUEUE_SITEMAP,
        identifier: QUEUE_SITEMAP,
      },
    ]),
  });
  await runner.promise;
}

runWorker().catch((err) => {
  console.error(err);
  process.exit(1);
});
