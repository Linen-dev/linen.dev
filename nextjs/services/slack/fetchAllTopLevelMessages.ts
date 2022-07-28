import { fetchConversationsTyped } from '../../fetch_all_conversations';
import { updateNextPageCursor } from '../../lib/models';
import {
  AccountWithSlackAuthAndChannels,
  UserMap,
} from '../../types/partialTypes';
import { channels } from '@prisma/client';

import prisma from '../../client';
import { ConversationHistoryMessage } from '../../fetch_all_conversations';
import { processReactions } from './reactions';
import { processAttachments } from './attachments';
import { getMentionedUsers } from './getMentionedUsers';
import { sleep } from '../../utilities/retryPromises';
import { parseSlackSentAt } from '../../utilities/sentAt';

async function saveMessagesTransaction(
  messages: ConversationHistoryMessage[],
  channelId: string,
  users: UserMap[],
  token: string
) {
  if (!messages.length) return;

  const threadsTransaction: any = messages
    .map((m) => {
      if (!!m.thread_ts) {
        return prisma.threads.upsert({
          where: {
            externalThreadId: m.thread_ts,
          },
          update: {},
          // maybe here, if creates, slug will be empty
          create: {
            externalThreadId: m.thread_ts,
            channelId,
            sentAt: parseSlackSentAt(m.thread_ts),
          },
        });
      }
      return null;
    })
    .filter((e) => e);

  const threads = await prisma.$transaction(threadsTransaction);

  const createMessagesTransaction = messages.map(async (m) => {
    let threadId: string | null;
    let thread: any | null;

    if (!!m.thread_ts) {
      thread = threads.find((t) => t.externalThreadId === m.thread_ts);
    }

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
  });
  console.log('Starting to save messages: ', new Date());
  await Promise.all(createMessagesTransaction);
  console.log('Finished saving messages', new Date());
}

export async function fetchAllTopLevelMessages({
  channels,
  account,
  usersInDb,
  token,
}: {
  channels: channels[];
  account: AccountWithSlackAuthAndChannels;
  usersInDb: UserMap[];
  token: string;
}) {
  for (let i = 0; i < channels.length; i++) {
    const c = channels[i];
    console.log('Syncing channel: ', c.channelName);
    let nextCursor = c.externalPageCursor || undefined;
    let firstLoop = true;
    if (nextCursor === 'completed') {
      console.log('channel completed syncing: ', c.channelName);
      continue;
    }
    let retries = 0;

    //fetch all messages by paginating
    while (!!nextCursor || firstLoop) {
      console.log('Messages cursor: ', nextCursor);
      try {
        const additionalConversations = await fetchConversationsTyped(
          c.externalChannelId,
          account.slackAuthorizations[0].accessToken,
          nextCursor
        );

        const additionalMessages = additionalConversations.messages;

        //save all messages
        await saveMessagesTransaction(
          additionalMessages,
          c.id,
          usersInDb,
          token
        );
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
        }
      }
      firstLoop = false;
    }
    await updateNextPageCursor(c.id, 'completed');
    console.log('channel completed syncing: ', c.channelName);
  }
}
