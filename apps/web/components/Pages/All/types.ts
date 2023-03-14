import { SerializedThread } from '@linen/types';

export interface DataResponse {
  threads: SerializedThread[];
  total: number;
}
