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

  static async find({ channelId, cursor }: FindType) {
    return await channelNextPage({ channelId, cursor });
  }

  static async get({ id }: GetType) {
    const thread = await findThreadById(id);
    if (!thread) {
      return null;
    }
    return serializeThread(thread);
  }

  static async update({ id, state, title, pinned }: UpdateType) {
    const thread = await prisma.threads.update({
      where: { id },
      data: {
        pinned,
        ...(title && { title, slug: createSlug(title) }),
        ...(state && {
          state,
          closeAt: state === ThreadState.CLOSE ? new Date().getTime() : null,
        }),
      },
    });
    // TODO: call eventThreadUpdate
    return serializeThread(thread);
  }

  static async create({
    authorId,
    channelId,
    body,
    files,
    imitationId,
  }: {
    authorId: string;
    channelId: string;
    body: string;
    files?: UploadedFile[];
    imitationId?: string;
  }) {
    const channel = await prisma.channels.findUnique({
      where: { id: channelId },
    });

    if (!channel || !channel.accountId) {
      throw { error: "Can't find the channel" };
    }

    const sentAt = new Date();

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
        slug: createSlug(body),
        messageCount: 1,
        messages: {
          create: {
            body,
            channel: { connect: { id: channelId } },
            sentAt,
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
}

export default ThreadsServices;
