import { threads } from '@linen/database';
import { ThreadState } from '@linen/types';

export default function createThread(options?: Partial<threads>): threads {
  return {
    id: '1',
    incrementId: 1,
    externalThreadId: 'X-1',
    viewCount: 0,
    slug: 'x',
    messageCount: 2,
    sentAt: BigInt(100),
    lastReplyAt: BigInt(100),
    channelId: '1',
    title: 'this is a title',
    hidden: false,
    state: ThreadState.OPEN,
    pinned: false,
    closeAt: null,
    firstManagerReplyAt: null,
    firstUserReplyAt: null,
    page: null,
    resolutionId: null,
    answer: null,
    question: null,
    feed: false,
    ...options,
  };
}
