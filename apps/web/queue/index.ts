import { downloadCert, getDatabaseUrl } from '@linen/database';
import { run, parseCronItems, JobHelpers } from 'graphile-worker';
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
  QUEUE_INTEGRATION_DISCORD,
  QUEUE_REMOVE_COMMUNITY,
  // QUEUE_USER_JOIN,
} from './jobs';
import { sitemap } from './tasks/sitemap';
import { pagination, schedulePaginationJob } from './tasks/pagination';
import { discordIntegration } from './tasks/discord-integration';
import { removeCommunity } from './tasks/remove-community';
import { discordBot, scheduleDiscordBotJob } from './tasks/discord-bot';
// import { userJoinTask } from './tasks/user-join';

export type TaskInterface = (
  payload: any,
  helpers: JobHelpers
) => Promise<void>;

async function runWorker() {
  await downloadCert();
  const runner = await run({
    connectionString: getDatabaseUrl({
      dbUrl: process.env.DATABASE_URL,
      cert: process.env.RDS_CERTIFICATE,
    }),
    concurrency: 10,
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
      [QUEUE_INTEGRATION_DISCORD]: discordIntegration,
      [QUEUE_REMOVE_COMMUNITY]: removeCommunity,
      // [QUEUE_USER_JOIN]: userJoinTask,
      discordBot,
      scheduleDiscordBotJob,
      pagination,
      schedulePaginationJob,
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
      {
        identifier: 'scheduleDiscordBotJob',
        pattern: '* * * * *',
        task: 'scheduleDiscordBotJob',
        options: {
          maxAttempts: 1,
          backfillPeriod: 0,
        },
      },
      {
        identifier: 'schedulePaginationJob',
        pattern: '*/30 * * * *',
        task: 'schedulePaginationJob',
        options: {
          maxAttempts: 1,
          backfillPeriod: 0,
        },
      },
    ]),
  });
  await runner.promise;
}

runWorker().catch((err) => {
  console.error(err);
  process.exit(1);
});
