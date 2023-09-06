import { prisma } from '@linen/database';

// mark as read
export async function mark({
  authId,
  threadId,
}: {
  authId: string;
  threadId: string;
}) {
  const notification = await prisma.notifications.findFirst({
    where: { authId, threadId },
  });
  if (!notification) {
    return { ok: false, result: 'not_found' };
  }
  await prisma.notifications.delete({ where: { id: notification.id } });
  return { ok: true, result: 'deleted' };
}

export async function getSettings({ authId }: { authId: string }) {
  return await prisma.auths.findUnique({
    select: { notificationsByEmail: true },
    where: { id: authId },
  });
}

export async function updateSettings({
  authId,
  notificationsByEmail,
}: {
  authId: string;
  notificationsByEmail: boolean;
}) {
  return await prisma.auths.update({
    select: { notificationsByEmail: true },
    where: { id: authId },
    data: { notificationsByEmail },
  });
}
