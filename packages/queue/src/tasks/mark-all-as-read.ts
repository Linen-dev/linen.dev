import UserThreadStatusService from '@linen/web/services/user-thread-status';

interface Payload {
  userId: string;
}

export async function markAllAsReadTask({ userId }: Payload, helpers: any) {
  helpers.logger.info(`Started marking all threads as read for user ${userId}`);
  await UserThreadStatusService.markAllAsRead({ userId });
  helpers.logger.info(
    `Finished marking all threads as read for user ${userId}`
  );
}
