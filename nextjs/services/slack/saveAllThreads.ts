import {
  ConversationHistoryMessage,
  fetchReplies,
} from '../../fetch_all_conversations';
import { retryPromise } from '../../utilities/retryPromises';
import { UserMap } from '../../types/partialTypes';
import { channels } from '@prisma/client';
import prisma from '../../client';
import {
  findOrCreateThread,
  findThreadsWithOnlyOneMessage,
} from '../../lib/threads';
import { createSlug } from '../../lib/util';
import { processReactions } from './reactions';
import { processAttachments } from './attachments';
import { getMentionedUsers } from './getMentionedUsers';
import { parseSlackSentAt } from '../../utilities/sentAt';

async function saveMessagesSynchronous(
  messages: ConversationHistoryMessage[],
  channelId: string,
  users: UserMap[],
  token: string
) {
  const threadHead = messages[0];
  if (threadHead.ts === threadHead.thread_ts) {
    await prisma.threads.update({
      where: { externalThreadId: threadHead.thread_ts },
      data: {
        messageCount: (threadHead.reply_count || 0) + 1,
        slug: createSlug(threadHead.text),
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
    });

    let user: UserMap | undefined;
    if (!!m.user) {
      user = users.find((u) => u.externalUserId === m.user);
    }

    threadId = thread?.id;
    const text = m.text as string;
    const mentionedUsers = getMentionedUsers(text, users);
    const serializedMessage = {
      body: m.text,
      blocks: m.blocks,
      sentAt: new Date(parseFloat(m.ts) * 1000),
      channelId,
      externalMessageId: m.ts as string,
      threadId: threadId,
      usersId: user?.id,
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

    await Promise.all([
      processReactions(m, message),
      processAttachments(m, message, token),
    ]);
  }
}

export async function saveAllThreads({
  channels,
  token,
  usersInDb,
}: {
  channels: channels[];
  token: string;
  usersInDb: UserMap[];
}) {
  const messageWithThreads = await findThreadsWithOnlyOneMessage(
    channels.map((c) => c.id)
  );
  console.log('syncing threads: ', messageWithThreads.length);

  for (let i = 0; i < messageWithThreads.length; i++) {
    if (i % 10 === 0) {
      console.log(i);
    }
    const m = messageWithThreads[i];
    const channel = channels.find((c) => c.id === m.channelId);

    try {
      const replies = await retryPromise({
        promise: fetchReplies(
          m.externalThreadId,
          channel!.externalChannelId,
          token
        ),
        sleepSeconds: 30,
      });

      const replyMessages: ConversationHistoryMessage[] =
        replies?.body?.messages;
      if (replyMessages && replyMessages.length) {
        await saveMessagesSynchronous(
          replyMessages,
          m.channelId,
          usersInDb,
          token
        );
      }
    } catch (e) {
      console.error(e);
    }
  }
}
