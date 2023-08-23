import { findOrCreateThread, findThreadsByChannel } from 'services/threads';
import { channels, prisma, threads } from '@linen/database';
import {
  UserMap,
  MessageFormat,
  ConversationHistoryMessage,
  Logger,
} from '@linen/types';
import { slugify } from '@linen/utilities/string';
import { processReactions } from './reactions';
import { processAttachments } from './attachments';
import { getMentionedUsers } from './getMentionedUsers';
import { parseSlackSentAt, tsToSentAt } from '@linen/serializers/sentAt';
import { filterMessages, parseMessage } from './parseMessage';
import { getBotUserId } from './getBotUserId';
import { updateNextPageCursor } from 'services/channels';

async function saveMessagesSynchronous(
  messages: ConversationHistoryMessage[],
  channelId: string,
  users: UserMap[],
  token: string,
  logger: Logger
) {
  const threadHead = messages[0];
  if (threadHead.ts === threadHead.thread_ts) {
    await prisma.threads.update({
      where: {
        channelId_externalThreadId: {
          externalThreadId: threadHead.thread_ts,
          channelId,
        },
      },
      data: {
        messageCount: (threadHead.reply_count || 0) + 1,
        slug: slugify(threadHead.text),
      },
    });
  }

  for (let j = 0; j < messages.length; j++) {
    const m = messages[j];
    let threadId: string | null;

    let ts = m.thread_ts || m.ts;
    const thread = await findOrCreateThread({
      externalThreadId: ts,
      channelId: channelId,
      sentAt: parseSlackSentAt(ts),
      lastReplyAt: parseSlackSentAt(ts),
      slug: slugify(m.text),
    });
    let user: UserMap | undefined;
    if (!m.user && !!m.bot_id) {
      m.user = await getBotUserId(m.bot_id, token);
    }
    if (!!m.user) {
      user = users.find((u) => u.externalUserId === m.user);
    }

    threadId = thread?.id;
    const text = m.text as string;
    const mentionedUsers = getMentionedUsers(text, users);
    const serializedMessage = {
      body: m.text,
      sentAt: tsToSentAt(m.ts),
      channelId,
      externalMessageId: m.ts as string,
      threadId: threadId,
      usersId: user?.id,
      messageFormat: MessageFormat.SLACK,
    };
    const message = await prisma.messages.upsert({
      where: {
        channelId_externalMessageId: {
          channelId: channelId,
          externalMessageId: m.ts,
        },
      },
      update: serializedMessage,
      create: {
        ...serializedMessage,
        mentions: {
          create: mentionedUsers.map((u) => ({ usersId: u.id })),
        },
      },
    });
    if (!!message.threadId) {
      await prisma.threads.updateMany({
        where: {
          id: message.threadId,
          lastReplyAt: { lt: message.sentAt.getTime() },
        },
        data: { lastReplyAt: message.sentAt.getTime() },
      });
    }
    await Promise.all([
      processReactions(m, message),
      processAttachments(m, message, token, logger),
    ]);
  }
}

export async function saveAllThreads({
  channel,
  token,
  usersInDb,
  fetchReplies,
  logger,
}: {
  channel: channels;
  token: string;
  usersInDb: UserMap[];
  fetchReplies: Function;
  logger: Logger;
}) {
  const channelName = channel.channelName;

  let cursor = 0;
  if (channel.externalPageCursor) {
    if (channel.externalPageCursor === 'completed') {
      logger.log({
        channelName,
        syncing: 'skipped. externalPageCursor=completed',
      });
      return;
    }
    try {
      let { threadCursor } = JSON.parse(channel.externalPageCursor);
      if (threadCursor && !isNaN(threadCursor)) {
        cursor = threadCursor;
      }
    } catch (error) {}
  }

  logger.log({ channelName, 'syncingAllThreads startedAt': new Date() });
  const tooManyRequests = [];

  do {
    logger.log({ channelName, cursor });
    const threads = await findThreadsByChannel({
      channelId: channel.id,
      cursor,
      limit: 25,
    });

    if (!threads?.length) break;

    logger.log({
      channelName,
      'saveAllThreadsTransaction startedAt': new Date(),
    });

    for (const thread of threads) {
      try {
        await fetchAndPersist(
          fetchReplies,
          thread,
          channel,
          token,
          usersInDb,
          logger
        );
      } catch (error) {
        logger.error({ error });
        // put it hold for trying later
        tooManyRequests.push(thread);
      }
    }

    cursor = Number(threads?.[threads?.length - 1]?.sentAt);
    await updateNextPageCursor(
      channel.id,
      JSON.stringify({ threadCursor: cursor })
    );
    logger.log({
      channelName,
      'saveAllThreadsTransaction finishedAt': new Date(),
    });
  } while (true);

  for (const thread of tooManyRequests) {
    await fetchAndPersist(
      fetchReplies,
      thread,
      channel,
      token,
      usersInDb,
      logger
    ).catch(logger.error);
  }

  await updateNextPageCursor(channel.id, 'completed');
  logger.log({ channelName, 'syncingAllThreads finishedAt': new Date() });
}

async function fetchAndPersist(
  fetchReplies: Function,
  thread: threads,
  channel: channels,
  token: string,
  usersInDb: UserMap[],
  logger: Logger
) {
  const replies = await fetchReplies(
    thread.externalThreadId,
    channel!.externalChannelId,
    token
  );
  const replyMessages: ConversationHistoryMessage[] =
    replies?.body?.messages?.filter(filterMessages).map(parseMessage) || [];

  if (replyMessages && replyMessages.length) {
    await saveMessagesSynchronous(
      replyMessages,
      thread.channelId,
      usersInDb,
      token,
      logger
    );
  }
}
