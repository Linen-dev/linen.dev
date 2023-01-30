import { SerializedUserThreadStatus } from '@linen/types';
import { userThreadStatus } from '@prisma/client';

export default function serialize(
  status: userThreadStatus
): SerializedUserThreadStatus {
  const { userId, threadId, muted, read } = status;
  return {
    userId,
    threadId,
    muted,
    read,
  };
}
