import type { channels } from '@prisma/client';

export default function createChannel(options?: Partial<channels>): channels {
  return {
    id: '1',
    channelName: 'general',
    externalChannelId: 'S1',
    accountId: 'A1',
    hidden: false,
    default: false,
    externalPageCursor: null,
    ...options,
  };
}
