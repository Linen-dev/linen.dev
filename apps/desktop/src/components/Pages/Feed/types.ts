import { SerializedThread } from '@linen/types';

export interface FeedResponse {
  threads: SerializedThread[];
  total: number;
}

export interface Selections {
  [key: string]: {
    checked: boolean;
    index: number;
  };
}
