import type { JobHelpers, AddJobFunction } from 'graphile-worker';
import FeedService from '@linen/web/services/feed';

const delay = 1000 * 60 * 5;

export const buildFeed = async (payload: any, helpers: JobHelpers) => {
  helpers.logger.info('buildFeed started');
  const start = Date.now();
  await FeedService.mark();
  const timeTaken = Date.now() - start;
  helpers.logger.info('buildFeed finished in ' + timeTaken + ' milliseconds');
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
