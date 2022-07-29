import type { channels } from '@prisma/client';

export interface SerializedChannel {
  channelName: string;
  hidden: boolean;
}

export function serializeChannel({
  channelName,
  hidden,
}: channels): SerializedChannel {
  return {
    channelName,
    hidden,
  };
}
