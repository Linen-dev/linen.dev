import serializeMessage from 'serializers/message';
import { find, parse } from '@linen/ast';
import { eventNewMessage } from 'services/events';
import { Prisma, prisma } from '@linen/database';
import { MessageFormat } from '@linen/types';
import { v4 as uuid } from 'uuid';
import unique from 'lodash.uniq';
import { UploadedFile } from '@linen/types';

export default class MessagesService {
  static async create({
    body,
    files,
    accountId,
    channelId,
    threadId,
    imitationId,
    userId,
    externalMessageId,
  }: {
    body: string;
    files?: UploadedFile[];
    accountId: string;
    channelId: string;
    threadId: string;
    imitationId?: string;
    userId: string;
    externalMessageId?: string;
  }) {
    const channel = await prisma.channels.findFirst({
      where: { id: channelId, accountId },
    });

    if (!channel || !channel.accountId || channel.accountId !== accountId) {
      throw new Error("can't find the channel");
    }

    const sentAt = new Date();

    const tree = parse.linen(body);
    const mentionNodes = find.mentions(tree);
    const userIds = unique(
      mentionNodes.map(({ id }: { id: string }) => id)
    ) as string[];
    const messages = {
      create: {
        body,
        channel: { connect: { id: channelId } },
        sentAt,
        author: { connect: { id: userId } },
        mentions: {
          create: userIds.map((id: string) => ({ usersId: id })),
        },
        externalMessageId,
        ...(files?.length && {
          attachments: {
            create: files.map((file: UploadedFile) => ({
              externalId: uuid(),
              name: file.id,
              sourceUrl: file.url,
              internalUrl: file.url,
            })),
          },
        }),
        messageFormat: MessageFormat.LINEN,
      } as Prisma.messagesCreateInput,
    };

    await prisma.threads.update({
      where: {
        id: threadId,
      },
      data: {
        messageCount: {
          increment: 1,
        },
        messages,
        lastReplyAt: new Date().getTime(),
      },
    });

    // TODO we could try to optimize this by combining this and previous query
    const message = await prisma.messages.findFirst({
      where: {
        body,
        channelId,
        sentAt,
        usersId: userId,
      },
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
    });

    if (!message) {
      throw new Error('failed to create message');
    }

    const serializedMessage = serializeMessage(message);
    await eventNewMessage({
      communityId: accountId,
      channelId,
      messageId: message.id,
      threadId,
      imitationId: imitationId || message.id,
      mentions: message.mentions,
      mentionNodes,
      message: JSON.stringify(serializedMessage),
    });

    return {
      message: serializedMessage,
      imitationId,
    };
  }

  static async get({ id, accountId }: { id: string; accountId: string }) {
    const message = await prisma.messages.findFirst({
      where: { id, channel: { accountId } },
      include: {
        author: true,
        mentions: {
          include: {
            users: true,
          },
        },
        reactions: true,
        attachments: true,
        channel: {
          select: { accountId: true },
        },
      },
    });

    if (!message) {
      return null;
    }

    return serializeMessage(message);
  }

  static async delete({ id, accountId }: { id: string; accountId: string }) {
    const message = await prisma.messages.findFirst({
      select: { id: true, threadId: true },
      where: { id, channel: { accountId } },
    });

    if (!message) {
      return null;
    }

    await prisma.messages.delete({
      where: {
        id: message.id,
      },
    });

    if (message.threadId) {
      const thread = await prisma.threads.findFirst({
        where: {
          id: message.threadId,
        },
        include: {
          _count: { select: { messages: true } },
        },
      });

      if (thread && thread._count.messages === 0) {
        await prisma.threads.delete({
          where: {
            id: thread.id,
          },
        });
      } else {
        await prisma.threads.update({
          where: {
            id: message.threadId,
          },
          data: { messageCount: { decrement: 1 } },
        });
      }
    }

    return { ok: true };
  }
}
