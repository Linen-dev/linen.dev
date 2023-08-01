import type { JobHelpers, AddJobFunction } from 'graphile-worker';
import FeedService from '@linen/web/services/feed';
import { Logger } from '../helpers/logger';

const delay = 1000 * 60 * 5;

export const buildFeed = async (_: any, helpers: JobHelpers) => {
  const start = Date.now();
  await FeedService.mark();
  const timeTaken = Date.now() - start;
  await createFeedJob(helpers.addJob, {
    runAt: new Date(Date.now() + delay + timeTaken),
  });
};

export const createFeedJob = async (
  addJob: AddJobFunction,
  opt: { runAt?: Date } = {}
) => {
  await addJob(
    'buildFeed',
    {},
    {
      jobKey: 'buildFeed',
      jobKeyMode: 'replace',
      queueName: 'buildFeed',
      ...opt,
    }
  );
};
