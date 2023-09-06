import { Logger } from '../../helpers/logger';
import { JobHelpers } from 'graphile-worker';
import { handleNotificationEmailTask } from './handleNotificationEmailTask';
import { handleNotificationEvent } from './handleNotificationEvent';

export async function notificationEvent(
  payload: any,
  helpers: JobHelpers
): Promise<void> {
  const logger = new Logger(helpers.logger);
  logger.info(helpers.job);
  const result = await handleNotificationEvent(payload, helpers);
  logger.info({ result });
}

export async function notificationEmailTask(
  payload: any,
  helpers: JobHelpers
): Promise<void> {
  const logger = new Logger(helpers.logger);
  logger.info(helpers.job);
  const result = await handleNotificationEmailTask({
    ...payload,
    locked_at: helpers.job.locked_at,
  });
  logger.info({ result });
}
