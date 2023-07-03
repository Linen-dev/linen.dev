import { run } from '@linen/pagination';
import { AddJobFunction, Task, JobHelpers } from 'graphile-worker';

export const QUEUE_BUILD_PAGINATION = 'pagination';

export const schedulePaginationJob: Task = async (_, helpers) => {
  await createPaginationJob({ addJob: helpers.addJob });
};

export const pagination = async (_: any, helpers: JobHelpers) => {
  helpers.logger.info('started');
  await run();
  helpers.logger.info('finished');
};

async function createPaginationJob({ addJob }: { addJob: AddJobFunction }) {
  await addJob(
    'pagination',
    {},
    {
      maxAttempts: 1,
      jobKeyMode: 'replace',
      queueName: `pagination`,
      jobKey: `pagination`,
    }
  );
}
