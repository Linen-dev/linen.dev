import { Roles, users, prisma } from '@linen/database';

export async function updateThreadMetrics(
  threadId: string,
  lastMessage: { sentAt: Date; author: users | null },
  field: 'firstManagerReplyAt' | 'firstUserReplyAt'
) {
  await prisma.threads.update({
    where: { id: threadId },
    data: { [field]: lastMessage.sentAt.getTime() },
  });
}

export async function getFirstAndLastMessages(
  threadId: string,
  messageId: string
) {
  return await Promise.all([
    prisma.messages.findFirst({
      where: { threads: { id: threadId } },
      take: 1,
      orderBy: { sentAt: 'asc' },
      select: { author: true },
    }),
    prisma.messages.findFirst({
      where: { id: messageId },
      select: { author: true, sentAt: true },
    }),
  ]);
}

export function isReplierMember(
  thread: {
    firstManagerReplyAt: bigint | null;
    firstUserReplyAt: bigint | null;
  } | null,
  last: { sentAt: Date; author: users | null } | null
) {
  return (
    !thread?.firstUserReplyAt &&
    last?.author?.role &&
    last?.author?.role === Roles.MEMBER
  );
}

export function isReplierManager(
  thread: {
    firstManagerReplyAt: bigint | null;
    firstUserReplyAt: bigint | null;
  } | null,
  last: { sentAt: Date; author: users | null } | null
) {
  return (
    !thread?.firstManagerReplyAt &&
    last?.author?.role &&
    (last?.author?.role === Roles.ADMIN || last?.author?.role === Roles.OWNER)
  );
}

export function areAuthorSameAsReplier(
  first: { author: users | null } | null,
  last: { sentAt: Date; author: users | null } | null
) {
  return first?.author?.id === last?.author?.id;
}

export function areRepliesAtFilled(
  thread: {
    firstManagerReplyAt: bigint | null;
    firstUserReplyAt: bigint | null;
  } | null
) {
  return thread?.firstManagerReplyAt && thread?.firstUserReplyAt;
}
