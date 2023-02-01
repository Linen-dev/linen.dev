import { ThreadStatus } from '@linen/types';
import { ThreadState } from '@prisma/client';

export type FindType = {
  accountId: string;
  channelId: string;
  cursor?: string;
  status?: ThreadStatus;
  userId?: string;
};

export type GetType = { id: string; accountId: string };

export type UpdateType = {
  id: string;
  accountId: string;
  state?: ThreadState;
  title?: string;
  pinned?: boolean;
};
