import { notificationListenerType, notificationType } from '@linen/types';
import { JobHelpers } from 'graphile-worker';
import { createNotificationEmailTask } from './createNotificationEmailTask';
import { scheduleDate } from './scheduleDate';
import { createNotification } from './createNotification';
import { prisma } from '@linen/database';

export async function processMentions({
  mentions,
  channelId,
  threadId,
  communityId,
  messageId,
  authorId,
  helpers,
  mentionNodes,
}: notificationListenerType & { authorId: string; helpers: JobHelpers }) {
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
      const runAt = scheduleDate(type); // 5 minutes
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

  const mentionChannel = mentionNodes.find((m) => m.id === 'channel');
  if (mentionChannel) {
    const members = await prisma.channels.findUnique({
      where: { id: channelId },
      select: {
        memberships: {
          select: {
            user: { select: { authsId: true } },
          },
          ...(!!authorId && {
            where: {
              user: {
                authsId: { not: authorId },
              },
            },
          }),
        },
      },
    });
    if (members?.memberships.length) {
      const type =
        mentionChannel.type === 'signal'
          ? notificationType.BANG_CHANNEL
          : notificationType.AT_CHANNEL;
      for (const authId of members.memberships.map((m) => m.user.authsId)) {
        if (authId) {
          const runAt = scheduleDate(type); // 30 seconds or 5 minutes
          await createNotification({
            authId,
            authorId,
            channelId,
            communityId,
            threadId,
            messageId,
            notificationType: type,
          });
          await createNotificationEmailTask({
            jobKey: `${type}-${authId}`,
            runAt,
            payload: {
              authId,
              notificationType: type,
            },
            helpers,
          });
        }
      }
    }
  }
}
