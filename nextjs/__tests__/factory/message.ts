import type { messages } from '@prisma/client';

export default function createMessage(options?: Partial<messages>): messages {
  return {
    id: '1',
    createdAt: new Date(),
    body: 'foo *bar* _baz_',
    sentAt: new Date(),
    externalMessageId: 'X-1',
    threadId: '1',
    channelId: '1',
    usersId: null,
    blocks: null,
    ...options,
  };
}
