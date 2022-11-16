import { threads, ThreadState } from '@prisma/client';
import prisma from 'client';

export default async function createThread(
  options?: Partial<threads>
): Promise<threads> {
  return prisma.threads.create({
    data: {
      sentAt: BigInt(100),
      lastReplyAt: BigInt(100),
      channelId: '1',
      ...options,
    },
  });
}
