import { notificationListenerType, notificationType } from '@linen/types';
import { JobHelpers } from 'graphile-worker';
import { prisma } from '@linen/database';
import { createNotificationEmailTask } from './createNotificationEmailTask';
import { scheduleDate } from './scheduleDate';
import { createNotification } from './createNotification';

export async function processSubscribers(
  data: notificationListenerType,
  authorId: string,
  helpers: JobHelpers
) {
  const thread = await prisma.threads.findUnique({
    select: {
      channel: { select: { accountId: true } },
      messages: {
        select: {
          author: { select: { id: true } },
          mentions: {
            select: {
              users: { select: { id: true } },
            },
          },
        },
      },
    },
    where: { id: data.threadId },
  });

  // unique users from mentions, replies and the author
  const users = thread?.messages
    .reduce(
      (prev, curr) =>
        Array.from(
          new Set([
            ...prev,
            ...(curr.author?.id ? [curr.author.id] : []),
            ...curr.mentions.reduce(
              (p, c) =>
                Array.from(
                  new Set([...p, ...(c.users?.id ? [c.users.id] : [])])
                ),
              [] as string[]
            ),
          ])
        ),
      [] as string[]
    )
    .filter((e) => e);

  const usersAuth = await prisma.users.findMany({
    select: { authsId: true },
    where: { id: { in: users }, authsId: {} },
  });

  return await Promise.allSettled(
    usersAuth.filter(skipSelfNotification(authorId)).map(async (user) => {
      const authId = user.authsId;
      if (!authId) throw 'authId not found';
      const type = notificationType.THREAD;
      await createNotification({
        authId,
        authorId,
        channelId: data.channelId,
        communityId: data.communityId,
        threadId: data.threadId,
        messageId: data.messageId,
        notificationType: type,
      });
      const runAt = scheduleDate(type); // add 30 min
      await createNotificationEmailTask({
        jobKey: `thread-${authId}`,
        runAt,
        payload: {
          authId,
          notificationType: type,
        },
        helpers,
      });
    })
  );
}

function skipSelfNotification(authorId: string) {
  return (value: { authsId: string | null }) => {
    return value.authsId !== authorId;
  };
}
