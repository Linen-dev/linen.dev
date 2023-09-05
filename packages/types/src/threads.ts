import { SerializedChannel } from './channels';
import { SerializedMessage } from './messages';
import { makeEnum } from './utils/makeEnum';

export interface SerializedThread {
  id: string;
  incrementId: number;
  externalThreadId?: string | null;
  viewCount: number;
  slug: string | null;
  messageCount: number;
  hidden: boolean;
  title?: string | null;
  state: ThreadState;
  pinned: boolean;
  channelId: string;
  closeAt?: string;
  firstUserReplyAt?: string | null;
  firstManagerReplyAt?: string | null;
  sentAt: string;
  lastReplyAt: string;
  messages: SerializedMessage[];
  channel: SerializedChannel | null;
  resolutionId?: string | null;
  page: number | null;
  question?: string | null;
  answer?: string | null;
  robotsMetaTag?:
    | 'all'
    | 'none'
    | 'noindex,nofollow'
    | 'noindex'
    | 'nofollow'
    | null;
}

export const ThreadState = makeEnum({
  OPEN: 'OPEN',
  CLOSE: 'CLOSE',
});
export type ThreadState = typeof ThreadState[keyof typeof ThreadState];

export const ThreadStatus = makeEnum({
  UNREAD: 'unread',
  READ: 'read',
  MUTED: 'muted',
  REMINDER: 'reminder',
});
export type ThreadStatus = typeof ThreadStatus[keyof typeof ThreadStatus];

export type threads = {
  id: string;
  incrementId: number;
  externalThreadId: string | null;
  viewCount: number;
  slug: string | null;
  messageCount: number;
  sentAt: bigint;
  hidden: boolean;
  title: string | null;
  question: string | null;
  answer: string | null;
  state: ThreadState;
  pinned: boolean;
  resolutionId: string | null;
  channelId: string;
  lastReplyAt: bigint | null;
  closeAt: bigint | null;
  firstUserReplyAt: bigint | null;
  firstManagerReplyAt: bigint | null;
  feed: boolean;
  page: number | null;
  robotsMetaTag: string | null;
  createdAt: Date;
  updatedAt: Date | null;
};
