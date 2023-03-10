import { SerializedThread } from '@linen/types';

export interface InboxResponse {
  threads: SerializedThread[];
  total: number;
}
