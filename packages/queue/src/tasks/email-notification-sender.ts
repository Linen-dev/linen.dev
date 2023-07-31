import { emailNotificationPayloadType } from '@linen/types';
import { sendEmailNotificationTask } from '@linen/web/services/notifications';

export async function emailNotificationTask(
  payload: emailNotificationPayloadType,
  helpers: any
): Promise<any> {
  helpers.logger.info(JSON.stringify(helpers.job));
  const result = await sendEmailNotificationTask({
    ...payload,
    locked_at: helpers.job.locked_at,
  });
  helpers.logger.info(JSON.stringify(result));
}
