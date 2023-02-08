import { ThreadState } from '@prisma/client';
import prisma from 'client';
import { findThreadById } from 'lib/threads';
import serializeThread from 'serializers/thread';
import { channelNextPage } from 'services/channel';
import {
  areAuthorSameAsReplier,
  areRepliesAtFilled,
  getFirstAndLastMessages,
  isReplierManager,
  isReplierMember,
  updateThreadMetrics,
} from './metrics';
import { createSlug } from 'utilities/util';
import { GetType, FindType, UpdateType } from './types';
import { MessageFormat, UploadedFile } from '@linen/types';
import { v4 as uuid } from 'uuid';
import { eventNewThread } from 'services/events';
import { parse, find } from '@linen/ast';
import unique from 'lodash.uniq';
import { eventThreadClosed } from 'services/events/eventThreadClosed';
import { eventThreadReopened } from 'services/events/eventThreadReopened';
import { eventThreadUpdated } from 'services/events/eventThreadUpdated';

class ThreadsServices {
  static async updateMetrics({
    messageId,
    threadId,
  }: {
    messageId: string;
    threadId: string;
  }) {
    const thread = await prisma.threads.findFirst({
      select: { firstManagerReplyAt: true, firstUserReplyAt: true },
      where: { id: threadId },
    });

    if (areRepliesAtFilled(thread)) {
      return Promise.resolve('nothing to update, already updated');
    } else {
      const [firstMessage, lastMessage] = await getFirstAndLastMessages(
        threadId,
        messageId
      );
      if (areAuthorSameAsReplier(firstMessage, lastMessage)) {
        return Promise.resolve('nothing to update, same author');
      }
      if (lastMessage && isReplierManager(thread, lastMessage)) {
        await updateThreadMetrics(threadId, lastMessage, 'firstManagerReplyAt');
        return Promise.resolve('done, firstManagerReplyAt');
      }
      if (lastMessage && isReplierMember(thread, lastMessage)) {
        await updateThreadMetrics(threadId, lastMessage, 'firstUserReplyAt');
        return Promise.resolve('done, firstUserReplyAt');
      }
    }
    return Promise.resolve('nothing to update');
  }

  static async find({
    channelId,
    cursor,
    accountId,
    userId,
    status,
  }: FindType) {
    const channel = await prisma.channels.findFirst({
      where: { id: channelId, accountId },
    });
    if (!channel) {
      return null;
    }
    return await channelNextPage({ channelId, cursor, userId, status });
  }

  static async get({ id, accountId }: GetType) {
    const thread = await findThreadById(id);
    if (!thread) {
      return null;
    }
    if (thread.channel?.accountId !== accountId) {
      return null;
    }
    return serializeThread(thread);
  }

  static async update({ id, state, title, pinned, accountId, resolutionId }: UpdateType) {
    const exist = await prisma.threads.findFirst({
      where: { id, channel: { accountId } },
    });
    if (!exist) {
      return null;
    }
    const thread = await prisma.threads.update({
      where: { id },
      data: {
        pinned,
        ...(title && { title, slug: createSlug(title) }),
        ...(state && {
          state,
          closeAt: state === ThreadState.CLOSE ? new Date().getTime() : null,
        }),
        resolutionId
      },
    });
    if (exist.state !== thread.state) {
      if (thread.state === ThreadState.CLOSE) {
        await eventThreadClosed({
          accountId,
          channelId: thread.channelId,
          threadId: id,
        });
      }
      if (thread.state === ThreadState.OPEN) {
        await eventThreadReopened({
          accountId,
          channelId: thread.channelId,
          threadId: id,
        });
      }
    }

    const serialized = serializeThread(thread);

    await eventThreadUpdated({
      communityId: accountId,
      channelId: thread.channelId,
      messageId: thread.id,
      threadId: thread.id,
      imitationId: thread.id,
      thread: JSON.stringify(serialized),
      mentionNodes: [],
      mentions: [],
    });

    return serialized;
  }

  static async create({
    authorId,
    channelId,
    body,
    files,
    imitationId,
    title,
    externalThreadId,
    sentAt,
    accountId,
  }: {
    authorId: string;
    channelId: string;
    body: string;
    files?: UploadedFile[];
    imitationId?: string;
    title?: string;
    externalThreadId?: string;
    sentAt?: Date;
    accountId: string;
  }) {
    const channel = await prisma.channels.findFirst({
      where: { id: channelId, accountId },
    });

    if (!channel || !channel.accountId || channel.accountId !== accountId) {
      throw { error: "Can't find the channel" };
    }

    sentAt = sentAt || new Date();

    const tree = parse.linen(body);
    const mentionNodes = find.mentions(tree);
    const userIds = unique(
      mentionNodes.map(({ id }: { id: string }) => id)
    ) as string[];

    const thread = await prisma.threads.create({
      data: {
        channel: { connect: { id: channelId } },
        sentAt: sentAt.getTime(),
        lastReplyAt: sentAt.getTime(),
        slug: createSlug(title || body),
        messageCount: 1,
        title,
        externalThreadId,
        messages: {
          create: {
            body,
            channel: { connect: { id: channelId } },
            sentAt,
            externalMessageId: externalThreadId,
            author: { connect: { id: authorId } },
            mentions: {
              create: userIds.map((id: string) => ({ usersId: id })),
            },
            ...(files &&
              files.length && {
                attachments: {
                  create: files.map((file) => ({
                    externalId: uuid(), // TODO should this be optional?
                    name: file.id,
                    sourceUrl: file.url, // TODO should this be optional?
                    internalUrl: file.url,
                  })),
                },
              }),
            messageFormat: MessageFormat.LINEN,
          },
        },
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
          take: 1,
        },
        channel: true,
      },
    });

    const serializedThread = serializeThread(thread);
    await eventNewThread({
      communityId: channel.accountId,
      channelId,
      messageId: thread.messages[0].id,
      threadId: thread.id,
      imitationId: imitationId || thread.messages[0].id,
      mentions: thread.messages[0].mentions,
      mentionNodes,
      thread: JSON.stringify(serializedThread),
    });

    return serializedThread;
  }

  static async findByExternalId({
    externalThreadId,
    channelId,
  }: {
    externalThreadId: string;
    channelId: string;
  }) {
    return await prisma.threads.findFirst({
      select: { id: true },
      where: { externalThreadId, channelId },
    });
  }
}

export default ThreadsServices;
