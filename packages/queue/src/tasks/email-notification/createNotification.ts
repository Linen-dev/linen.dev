import { Prisma, prisma } from '@linen/database';

export async function createNotification(
  data: Prisma.notificationsUncheckedCreateInput
) {
  const exist = await prisma.notifications.findFirst({
    where: {
      authId: data.authId,
      channelId: data.channelId,
      notificationType: data.notificationType,
      ...(data.threadId && { threadId: data.threadId }),
    },
  });
  if (exist) {
    return exist;
  }
  return await prisma.notifications.create({ data });
}
