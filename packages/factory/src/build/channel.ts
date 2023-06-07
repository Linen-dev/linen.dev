import type { channels } from '@linen/database';

export default function createChannel(options?: Partial<channels>): channels {
  return {
    id: '1',
    channelName: 'general',
    externalChannelId: 'S1',
    accountId: 'A1',
    hidden: false,
    default: false,
    externalPageCursor: null,
    lastPageBuildAt: null,
    pages: null,
    archived: false,
    createdByUserId: null,
    type: 'PUBLIC',
    createdAt: new Date(),
    updatedAt: null,
    displayOrder: 0,
    viewType: 'CHAT',
    ...options,
  };
}
