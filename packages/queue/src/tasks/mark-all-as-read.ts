import { Logger } from '../helpers/logger';
import UserThreadStatusService from '@linen/web/services/user-thread-status';

interface Payload {
  userId: string;
}

export async function markAllAsReadTask({ userId }: Payload, helpers: any) {
  const logger = new Logger(helpers.logger);
  logger.info({ 'Started marking all threads as read for user': userId });
  await UserThreadStatusService.markAllAsRead({ userId });
  logger.info({ 'Finished marking all threads as read for user': userId });
}
