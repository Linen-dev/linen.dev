import { notificationListenerType } from '@linen/types';
import { handleNewEvent } from 'services/notifications';

export async function processNewEventTask(
  payload: notificationListenerType,
  helpers: any
): Promise<any> {
  helpers.logger.info(JSON.stringify(helpers.job));
  const result = await handleNewEvent(payload);
  helpers.logger.info(JSON.stringify(result));
}
