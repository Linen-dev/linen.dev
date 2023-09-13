import { prisma } from '@linen/database';
import { AnonymizeType, SerializedThread, SerializedTopic } from '@linen/types';
import { anonymizeMessages } from '@linen/serializers/anonymizeMessages';
import { serializeThread, serializeTopic } from '@linen/serializers/thread';

const limit = 30;

export async function findTopics({
  channelId,
  accountId,
  sentAt = new Date(),
  direction = 'lt',
  anonymize,
}: {
  channelId: string;
  accountId: string;
  sentAt?: Date;
  direction?: 'lt' | 'gt';
  anonymize: AnonymizeType;
}): Promise<{
  topics: SerializedTopic[];
  threads: SerializedThread[];
}> {
  const messages = await prisma.messages.findMany({
    take: limit,
    select: {
      id: true,
      threadId: true,
      sentAt: true,
      usersId: true,
    },
    where: {
      channel: { hidden: false, id: channelId, accountId },
      threads: { hidden: false },
      sentAt: { [direction]: sentAt },
    },
    orderBy: { sentAt: 'desc' },
  });

  const threads = await prisma.threads.findMany({
    where: {
      hidden: false,
      id: { in: messages.map((m) => m.threadId!) },
    },
    include: {
      messages: {
        include: {
          author: true,
          mentions: {
            include: {
              users: true,
            },
          },
          reactions: true,
          attachments: true,
        },
        orderBy: { sentAt: 'asc' },
      },
      channel: true,
    },
  });

  return {
    topics: messages.map(serializeTopic),
    threads: (anonymize !== AnonymizeType.NONE
      ? threads.map((thread) => anonymizeMessages(thread, anonymize))
      : threads
    ).map(serializeThread),
  };
}
