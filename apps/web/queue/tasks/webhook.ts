import { handleWebhook } from 'services/slack/webhooks';
import { type JobHelpers } from 'graphile-worker';

export const webhook = async (payload: any, helpers: JobHelpers) => {
  helpers.logger.info(JSON.stringify(payload));
  const result = await handleWebhook(payload);
  helpers.logger.info(JSON.stringify(result));
};
