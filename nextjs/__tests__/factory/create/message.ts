import { messages, MessageFormat, Prisma } from '@prisma/client';
import prisma from 'client';

export default async function createMessage(
  options?: Partial<messages>
): Promise<messages> {
  return prisma.messages.create({
    data: {
      createdAt: new Date(),
      body: 'foo *bar* _baz_',
      sentAt: new Date(),
      externalMessageId: null,
      threadId: '1',
      channelId: '1',
      messageFormat: MessageFormat.LINEN,
      ...options,
    } as any,
  });
}
