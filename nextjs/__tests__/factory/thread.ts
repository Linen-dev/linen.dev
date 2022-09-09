import { threads, ThreadState } from '@prisma/client';

export default function createThread(options?: Partial<threads>): threads {
  return {
    id: '1',
    incrementId: 1,
    externalThreadId: 'X-1',
    viewCount: 0,
    slug: 'x',
    messageCount: 2,
    sentAt: BigInt(100),
    channelId: '1',
    title: 'this is a title',
    hidden: false,
    state: ThreadState.OPEN,
    ...options,
  };
}
