import { SerializedChannel } from './channels';
import { SerializedMessage } from './messages';

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
  lastActivityAt: string;
  messages: SerializedMessage[];
  channel: SerializedChannel | null;
  resolutionId?: string | null;
  page: number | null;
  question?: string | null;
  answer?: string | null;
}

export enum ThreadState {
  CLOSE = 'CLOSE',
  OPEN = 'OPEN',
}

export enum ThreadStatus {
  UNREAD = 'unread',
  READ = 'read',
  MUTED = 'muted',
  REMINDER = 'reminder',
}
