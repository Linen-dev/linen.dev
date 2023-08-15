import { serializeMessage } from '@linen/serializers/message';
import { find, parse } from '@linen/ast';
import { eventNewMessage } from 'services/events/eventNewMessage';
import { Prisma, prisma } from '@linen/database';
import {
  messageFindResponseType,
  messageFindType,
  MessageFormat,
  messageGetResponseType,
  messageGetType,
  messagePutType,
  UploadedFile,
} from '@linen/types';
import { v4 as uuid } from 'uuid';
import unique from 'lodash.uniq';
import { eventMessageDeletion } from 'services/events/eventMessageDeletion';

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
    mentions,
    messageFormat = MessageFormat.LINEN,
  }: {
    body: string;
    files?: UploadedFile[];
    accountId: string;
    channelId: string;
    threadId: string;
    imitationId?: string;
    userId: string;
    externalMessageId?: string;
    mentions?: { id: string }[];
    messageFormat?: MessageFormat;
  }) {
    const channel = await prisma.channels.findFirst({
      where: { id: channelId, accountId },
    });

    if (!channel || !channel.accountId || channel.accountId !== accountId) {
      throw new Error("can't find the channel");
    }

    const sentAt = new Date();

    const tree = parse.linen(body);
    const mentionNodes = mentions || find.mentions(tree);
    const userIds = unique<string>(
      mentionNodes.map(({ id }: { id: string }) => id)
    );
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
        messageFormat,
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

    await prisma.userThreadStatus.upsert({
      create: {
        threadId,
        read: true,
        muted: false,
        userId,
      },
      update: {
        read: true,
        muted: false,
        reminder: false,
        remindAt: null,
      },
      where: {
        userId_threadId: { userId, threadId },
      },
    });

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
      userId,
      isLinenMessage: messageFormat === MessageFormat.LINEN,
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
      select: { id: true, threadId: true, attachments: true, channel: true },
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

      if (thread) {
        if (thread._count.messages === 0) {
          await prisma.threads.delete({
            where: {
              id: thread.id,
            },
          });
        } else {
          await prisma.threads.update({
            where: {
              id: thread.id,
            },
            data: { messageCount: thread._count.messages },
          });
        }
      }
    }

    await eventMessageDeletion({
      messageId: message.id,
      threadId: message.threadId,
      attachments: message.attachments,
      accountId,
    });

    return { ok: true };
  }

  static async find({
    channelId,
    externalMessageId,
    threadId,
    mustHave,
    orderBy,
    sortBy,
  }: messageFindType): Promise<messageFindResponseType> {
    return await prisma.messages.findFirst({
      select: { threadId: true, id: true, externalMessageId: true },
      where: {
        ...(externalMessageId && { externalMessageId }),
        channelId,
        threadId,
        ...mustHave?.reduce(
          (prev, cur) => ({
            ...prev,
            ...(!!cur && { [cur as any]: {} }),
          }),
          {}
        ),
      },
      ...(sortBy &&
        orderBy && {
          orderBy: { [sortBy]: orderBy },
        }),
    });
  }

  static async getOne({
    messageId,
  }: messageGetType): Promise<messageGetResponseType> {
    return await prisma.messages.findUnique({
      where: { id: messageId },
      select: {
        body: true,
        channelId: true,
        externalMessageId: true,
        threadId: true,
        author: { select: { displayName: true, profileImageUrl: true } },
      },
    });
  }

  static async update({ messageId, body, externalMessageId }: messagePutType) {
    if (body) {
      return await prisma.messages.update({
        where: { id: messageId },
        data: { body },
      });
    }
    return await prisma.messages.update({
      where: { id: messageId },
      data: { externalMessageId },
    });
  }

  static async findMessageByChannelIdAndTs({
    channelId,
    ts,
  }: {
    channelId: string;
    ts: string;
  }) {
    return prisma.messages.findFirst({
      select: { id: true, channel: { select: { accountId: true } } },
      where: {
        channelId: channelId,
        externalMessageId: ts,
      },
    });
  }

  static createMessageWithMentions = async (
    message: Prisma.messagesUncheckedCreateInput,
    mentionsId: string[]
  ) => {
    const msg = {
      body: message.body,
      threadId: message.threadId,
      externalMessageId: message.externalMessageId,
      channelId: message.channelId,
      sentAt: message.sentAt,
      usersId: message.usersId,
      messageFormat: message.messageFormat,
    };
    const newMessage = await prisma.messages.upsert({
      include: { mentions: { include: { users: true } }, author: true },
      create: {
        ...msg,
        mentions: {
          create: mentionsId.map((id) => ({ usersId: id })),
        },
      },
      where: {
        channelId_externalMessageId: {
          externalMessageId: message.externalMessageId!,
          channelId: message.channelId,
        },
      },
      update: {
        ...msg,
      },
    });
    if (!!newMessage.threadId) {
      await prisma.threads.updateMany({
        where: {
          id: newMessage.threadId,
          lastReplyAt: { lt: newMessage.sentAt.getTime() },
        },
        data: { lastReplyAt: newMessage.sentAt.getTime() },
      });
    }
    return newMessage;
  };
}
