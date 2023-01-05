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
}

export default ThreadsServices;
