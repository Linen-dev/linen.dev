import { ThreadState } from '@prisma/client';

export type FindType = {
  channelId: string;
  cursor?: string;
};

export type GetType = { id: string };

export type UpdateType = {
  id: string;
  state?: ThreadState;
  title?: string;
  pinned?: boolean;
};
