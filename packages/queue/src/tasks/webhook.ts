import { Logger } from '../helpers/logger';
import { handleWebhook } from '@linen/web/services/slack/webhooks';
import { type JobHelpers } from 'graphile-worker';

export const webhook = async (payload: any, helpers: JobHelpers) => {
  const logger = new Logger(helpers.logger);
  logger.info(payload);
  const result = await handleWebhook(payload, logger);
  logger.info({ result });
};
