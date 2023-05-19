import { ThreadState } from '@linen/database';

export type FindType = {
  accountId: string;
  channelId: string;
  cursor?: string;
};

export type GetType = { id: string; accountId: string };

export type UpdateType = {
  id: string;
  accountId?: string;
  channelId?: string;
  state?: ThreadState;
  title?: string;
  pinned?: boolean;
  resolutionId?: string | null;
  externalThreadId?: string;
  message?: string;
};
