import { ThreadState } from '@prisma/client';

export type FindType = {
  accountId: string;
  channelId: string;
  cursor?: string;
};

export type GetType = { id: string; accountId: string };

export type UpdateType = {
  id: string;
  accountId: string;
  state?: ThreadState;
  title?: string;
  pinned?: boolean;
};
