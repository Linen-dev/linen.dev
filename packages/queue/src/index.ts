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
import { sitemap } from './tasks/sitemap';
import { discordIntegration } from './tasks/discord-integration';
import { removeCommunity } from './tasks/remove-community';
import { buildFeed, createFeedJob } from './tasks/build-feed';
import { checkPropagation } from './tasks/custom-domain-propagate';
import { cleanupUserThreadStatusTask } from './tasks/cleanup-user-thread-status';
import {
  typesenseSetup,
  typesenseSyncAll,
  typesenseSync,
  typesenseDeletion,
  typesenseRefreshApiKeys,
  typesenseOnChannelNameUpdate,
  typesenseOnChannelTypeUpdate,
  typesenseOnCommunityTypeUpdate,
  typesenseOnUserNameUpdate,
} from './tasks/typesense';

export type TaskInterface = (
  payload: any,
  helpers: JobHelpers
) => Promise<void>;

const QUEUE_1_NEW_EVENT = 'notification-new-event';
const QUEUE_2_SEND_EMAIL = 'notification-send-email';
const QUEUE_REMIND_ME_LATER = 'remind-me-later-queue';
const QUEUE_MARK_ALL_AS_READ = 'mark-all-as-read-queue';
const QUEUE_CLEANUP_USER_THREAD_STATUS = 'cleanup-user-thread-status-queue';
const QUEUE_MAINTENANCE_MESSAGE_COUNT = 'update-message-count';
const QUEUE_CRAWL_GOOGLE_STATS = 'google-stats';
const QUEUE_INTEGRATION_DISCORD = 'integration-discord';
const QUEUE_REMOVE_COMMUNITY = 'remove-community';

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
      [QUEUE_CLEANUP_USER_THREAD_STATUS]: cleanupUserThreadStatusTask as any,
      [QUEUE_MAINTENANCE_MESSAGE_COUNT]: updateMessagesCount,
      [QUEUE_CRAWL_GOOGLE_STATS]: crawlGoogleResults,
      [QUEUE_INTEGRATION_DISCORD]: discordIntegration,
      [QUEUE_REMOVE_COMMUNITY]: removeCommunity as any,
      ['two-way-sync']: twoWaySync,
      sync,
      webhook,
      slugify,
      sitemap,
      buildFeed,
      checkPropagation,
      typesenseSetup,
      typesenseSync,
      typesenseSyncAll,
      typesenseDeletion,
      typesenseRefreshApiKeys,
      typesenseOnChannelNameUpdate,
      typesenseOnChannelTypeUpdate,
      typesenseOnCommunityTypeUpdate,
      typesenseOnUserNameUpdate,
    },
    parsedCronItems: parseCronItems([
      {
        pattern: '0 */2 * * *', // every 2 hours
        options: {
          queueName: 'checkPropagation',
          backfillPeriod: 0,
        },
        task: 'checkPropagation',
        identifier: 'checkPropagation',
      },
      {
        pattern: '00 3 * * *', // every day at 03:00
        options: {
          queueName: 'slugify',
          backfillPeriod: 0,
        },
        task: 'slugify',
        identifier: 'slugify',
      },
      {
        pattern: '00 3 * * *', // every day at 03:00
        options: {
          queueName: QUEUE_MAINTENANCE_MESSAGE_COUNT,
          backfillPeriod: 0,
        },
        task: QUEUE_MAINTENANCE_MESSAGE_COUNT,
        identifier: QUEUE_MAINTENANCE_MESSAGE_COUNT,
      },
      {
        pattern: '00 3 * * 1,5', // at 03:00 on Monday and Friday
        options: {
          queueName: QUEUE_CRAWL_GOOGLE_STATS,
          backfillPeriod: 0,
        },
        task: QUEUE_CRAWL_GOOGLE_STATS,
        identifier: QUEUE_CRAWL_GOOGLE_STATS,
      },
      {
        pattern: '0 23 * * *', // every day at 23:00
        options: {
          queueName: QUEUE_CLEANUP_USER_THREAD_STATUS,
          backfillPeriod: 0,
        },
        task: QUEUE_CLEANUP_USER_THREAD_STATUS,
        identifier: QUEUE_CLEANUP_USER_THREAD_STATUS,
      },
      {
        pattern: '0 0 * * *', // every day at 0:00
        options: {
          queueName: 'sitemap',
          backfillPeriod: 0,
        },
        task: 'sitemap',
        identifier: 'sitemap',
      },
      {
        pattern: '0 0 * * *', // every day at 0:00
        options: {
          queueName: 'typesenseRefreshApiKeys',
          backfillPeriod: 0,
        },
        task: 'typesenseRefreshApiKeys',
        identifier: 'typesenseRefreshApiKeys',
      },
      {
        pattern: '0 * * * *', // every 1 hour
        options: {
          queueName: 'typesenseSyncAll',
          backfillPeriod: 0,
          maxAttempts: 1,
        },
        task: 'typesenseSyncAll',
        identifier: 'typesenseSyncAll',
      },
    ]),
  });
  await createFeedJob(runner.addJob);
  await runner.addJob('checkPropagation');
  await runner.promise;
}

runWorker().catch((err) => {
  console.error(err);
  process.exit(1);
});
