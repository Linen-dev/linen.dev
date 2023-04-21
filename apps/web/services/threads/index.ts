import { ThreadState, prisma } from '@linen/database';
import { findThreadById } from 'lib/threads';
import { serializeThread } from '@linen/serializers/thread';
import { channelNextPage } from 'services/channels/channelNextPage';
import {
  areAuthorSameAsReplier,
  areRepliesAtFilled,
  getFirstAndLastMessages,
  isReplierManager,
  isReplierMember,
  updateThreadMetrics,
} from './metrics';
import { slugify } from '@linen/utilities/string';
import { GetType, FindType, UpdateType } from './types';
import {
  MessageFormat,
  threadFindResponseType,
  threadFindType,
  UploadedFile,
} from '@linen/types';
import { v4 as uuid } from 'uuid';
import { eventNewThread } from 'services/events';
import { parse, find } from '@linen/ast';
import unique from 'lodash.uniq';
import { eventThreadClosed } from 'services/events/eventThreadClosed';
import { eventThreadReopened } from 'services/events/eventThreadReopened';
import { eventThreadUpdated } from 'services/events/eventThreadUpdated';
import { stringify } from 'superjson';

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

  static async find({ channelId, cursor, accountId }: FindType) {
    const channel = await prisma.channels.findFirst({
      where: { id: channelId, accountId },
    });
    if (!channel) {
      return null;
    }
    return await channelNextPage({ channelId, cursor });
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

  static async update({
    id,
    state,
    title,
    pinned,
    accountId,
    channelId,
    resolutionId,
    externalThreadId,
  }: UpdateType) {
    const exist = await prisma.threads.findFirst({
      where: { id, channel: { accountId, id: channelId } },
    });
    if (!exist) {
      return null;
    }
    const thread = await prisma.threads.update({
      include: { channel: { select: { accountId: true } } },
      where: { id },
      data: {
        pinned,
        ...(title && { title, slug: slugify(title) }),
        ...(state && {
          state,
          closeAt: state === ThreadState.CLOSE ? new Date().getTime() : null,
        }),
        resolutionId,
        externalThreadId,
      },
    });

    console.log(stringify({ if: exist.state !== thread.state, exist, thread }));

    if (exist.state !== thread.state) {
      if (thread.state === ThreadState.CLOSE) {
        await eventThreadClosed({
          accountId: accountId || thread.channel.accountId!,
          channelId: thread.channelId,
          threadId: id,
        });
      } else if (thread.state === ThreadState.OPEN) {
        await eventThreadReopened({
          accountId: accountId || thread.channel.accountId!,
          channelId: thread.channelId,
          threadId: id,
        });
      }
    }

    const serialized = serializeThread(thread);

    await eventThreadUpdated({
      communityId: accountId || thread.channel.accountId!,
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
    mentions,
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
    mentions?: { id: string }[];
  }) {
    const channel = await prisma.channels.findFirst({
      where: { id: channelId, accountId },
    });

    if (!channel || !channel.accountId || channel.accountId !== accountId) {
      throw { error: "Can't find the channel" };
    }

    sentAt = sentAt || new Date();

    const tree = parse.linen(body);
    const mentionNodes = mentions || find.mentions(tree);
    const userIds = unique<string>(
      mentionNodes.map(({ id }: { id: string }) => id)
    );

    const thread = await prisma.threads.create({
      data: {
        channel: { connect: { id: channelId } },
        sentAt: sentAt.getTime(),
        lastReplyAt: sentAt.getTime(),
        slug: slugify(title || body),
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
        userThreadStatus: {
          create: {
            read: true,
            muted: false,
            userId: authorId,
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
      userId: authorId,
    });

    return serializedThread;
  }

  static async findBy({
    externalThreadId,
    channelId,
    threadId,
  }: threadFindType): Promise<threadFindResponseType> {
    return await prisma.threads.findFirst({
      select: {
        id: true,
        title: true,
        externalThreadId: true,
        channelId: true,
        messages: {
          select: {
            body: true,
            author: { select: { displayName: true, profileImageUrl: true } },
          },
          orderBy: { sentAt: 'asc' },
          take: 1,
        },
      },
      where: { channelId, OR: [{ externalThreadId }, { id: threadId }] },
    });
  }
}

export default ThreadsServices;
