import { notificationListenerType } from '@linen/types';
import { Logger } from '../helpers/logger';
import { handleNewEvent } from '@linen/web/services/notifications';

export async function processNewEventTask(
  payload: notificationListenerType,
  helpers: any
): Promise<any> {
  const logger = new Logger(helpers.logger);
  logger.info(helpers.job);
  const result = await handleNewEvent(payload);
  logger.info({ result });
}
