import { updateNextPageCursor } from 'lib/models';
import { AccountWithSlackAuthAndChannels, UserMap } from 'types/partialTypes';
import { channels, MessageFormat } from '@prisma/client';

import prisma from '../../../client';
import type { ConversationHistoryMessage } from '../api';
import { processReactions } from './reactions';
import { processAttachments } from './attachments';
import { getMentionedUsers } from './getMentionedUsers';
import { sleep } from 'utilities/retryPromises';
import { parseSlackSentAt, tsToSentAt } from 'utilities/sentAt';
import { findOrCreateThread } from 'lib/threads';
import { createSlug } from 'utilities/util';
import { captureException, flush } from '@sentry/nextjs';

async function saveMessagesTransaction(
  messages: ConversationHistoryMessage[],
  channelId: string,
  users: UserMap[],
  token: string
) {
  if (!messages.length) return;
  console.log('Starting to save messages: ', new Date());

  const threads = await Promise.all(
    messages.map((m) => {
      return findOrCreateThread({
        channelId,
        externalThreadId: m.ts,
        sentAt: parseSlackSentAt(m.ts),
        slug: createSlug(m.text),
        messageCount: (m.reply_count || 0) + 1,
      });
    })
  );

  const createMessagesTransaction = messages.map(async (m) => {
    const thread = threads.find((t) => t.externalThreadId === m.ts);

    let user: UserMap | undefined;
    if (!!m.user) {
      user = users.find((u) => u.externalUserId === m.user);
    }

    const text = m.text as string;
    const mentionedUsers = getMentionedUsers(text, users);
    const serializedMessage = {
      body: m.text,
      blocks: m.blocks,
      sentAt: tsToSentAt(m.ts),
      channelId,
      externalMessageId: m.ts as string,
      threadId: thread?.id,
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
    await Promise.all([
      processReactions(m, message),
      processAttachments(m, message, token),
    ]);
  });
  await Promise.all(createMessagesTransaction);
  console.log('Finished saving messages', new Date());
}

export async function fetchAllTopLevelMessages({
  channel,
  usersInDb,
  token,
  fullSync,
  fetchConversationsTyped,
}: {
  channel: channels;
  account: AccountWithSlackAuthAndChannels;
  usersInDb: UserMap[];
  token: string;
  fullSync?: boolean | undefined;
  fetchConversationsTyped: Function;
}) {
  const c = channel;
  if (fullSync) {
    c.externalPageCursor = null;
  }
  console.log('Syncing channel: ', c.channelName);
  let nextCursor = c.externalPageCursor || undefined;
  let firstLoop = true;
  if (nextCursor === 'completed') {
    console.log('channel completed syncing: ', c.channelName);
    return;
  }
  let retries = 0;

  //fetch all messages by paginating
  while (!!nextCursor || firstLoop) {
    console.log('Messages cursor: ', nextCursor);
    try {
      const additionalConversations = await fetchConversationsTyped(
        c.externalChannelId,
        token,
        nextCursor
      );

      const additionalMessages = additionalConversations.messages;
      console.log('messages.length', additionalMessages.length);
      //save all messages
      await saveMessagesTransaction(additionalMessages, c.id, usersInDb, token);
      nextCursor = additionalConversations.response_metadata?.next_cursor;

      // save cursor in database so don't have
      //to refetch same conversation if script fails
      !!nextCursor && (await updateNextPageCursor(c.id, nextCursor));
    } catch (e) {
      console.log('fetching messages failed', (e as Error).message, e);
      await sleep(10000);
      retries += 1;
      if (retries > 3) {
        nextCursor = undefined;
        captureException(e);
        await flush(2000);
      }
    }
    firstLoop = false;
  }
  await updateNextPageCursor(c.id, 'completed');
  console.log('channel completed syncing: ', c.channelName);
}
