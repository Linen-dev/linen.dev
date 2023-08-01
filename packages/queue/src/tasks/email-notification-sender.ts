import { emailNotificationPayloadType } from '@linen/types';
import { Logger } from '../helpers/logger';
import { sendEmailNotificationTask } from '@linen/web/services/notifications';

export async function emailNotificationTask(
  payload: emailNotificationPayloadType,
  helpers: any
): Promise<any> {
  const logger = new Logger(helpers.logger);
  logger.info(helpers.job);
  const result = await sendEmailNotificationTask({
    ...payload,
    locked_at: helpers.job.locked_at,
  });
  logger.info({ result });
}
