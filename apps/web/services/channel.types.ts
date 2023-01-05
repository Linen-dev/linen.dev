import { SerializedThread } from '@linen/types';

export type channelNextPageType = {
  threads: SerializedThread[];
  nextCursor: {
    next: string | null;
    prev: string | null;
  };
};
