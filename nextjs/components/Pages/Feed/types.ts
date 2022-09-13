import { SerializedThread } from 'serializers/thread';

export interface FeedResponse {
  threads: SerializedThread[];
}

export interface Selections {
  [key: string]: boolean;
}
