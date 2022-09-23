import { chatSyncJob } from 'services/sync';
import { type JobHelpers } from 'graphile-worker';

export const chatSync = async (payload: any, helpers: JobHelpers) => {
  helpers.logger.info(JSON.stringify(payload));
  const result = await chatSyncJob(payload);
  helpers.logger.info(JSON.stringify(result));
};
