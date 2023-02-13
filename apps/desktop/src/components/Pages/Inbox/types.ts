import { SerializedThread } from '@linen/types';

export interface InboxResponse {
  threads: SerializedThread[];
  total: number;
}

export interface Selections {
  [key: string]: {
    checked: boolean;
    index: number;
  };
}
