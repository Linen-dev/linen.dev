import { messages } from '@prisma/client';
import { MessageFormat } from '@linen/types';

export default function createMessage(options?: Partial<messages>): messages {
  return {
    id: '1',
    createdAt: new Date(),
    body: 'foo *bar* _baz_',
    sentAt: new Date(),
    externalMessageId: null,
    threadId: '1',
    channelId: '1',
    usersId: null,
    blocks: null,
    messageFormat: MessageFormat.LINEN,
    ...options,
  };
}
