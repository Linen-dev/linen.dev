import { notificationListenerType } from '@linen/types';
import { handleNewEvent } from '@linen/web/services/notifications';

export async function processNewEventTask(
  payload: notificationListenerType,
  helpers: any
): Promise<any> {
  helpers.logger.info(JSON.stringify(helpers.job));
  const result = await handleNewEvent(payload);
  helpers.logger.info(JSON.stringify(result));
}
