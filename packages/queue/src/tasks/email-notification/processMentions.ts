import { notificationListenerType, notificationType } from '@linen/types';
import { JobHelpers } from 'graphile-worker';
import { createNotificationEmailTask } from './createNotificationEmailTask';
import { scheduleDate } from './scheduleDate';
import { createNotification } from './createNotification';

export async function processMentions(
  {
    mentions,
    channelId,
    threadId,
    communityId,
    messageId,
  }: notificationListenerType,
  authorId: string,
  helpers: JobHelpers
) {
  for (const mention of mentions) {
    if (!mention?.users?.authsId) {
      continue;
    }
    try {
      const authId = mention.users.authsId;
      const type = notificationType.MENTION;
      await createNotification({
        authId,
        authorId,
        channelId,
        communityId,
        threadId,
        messageId,
        notificationType: type,
      });
      const runAt = scheduleDate(type); // add 15 min
      await createNotificationEmailTask({
        jobKey: `mention-${authId}`,
        runAt,
        payload: {
          authId,
          notificationType: type,
        },
        helpers,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
