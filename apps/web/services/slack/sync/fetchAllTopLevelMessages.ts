import { updateNextPageCursor } from 'services/channels';
import { channels, prisma } from '@linen/database';
import {
  AccountWithSlackAuthAndChannels,
  UserMap,
  MessageFormat,
  ConversationHistoryMessage,
  Logger,
} from '@linen/types';
import { getBotUserId } from './getBotUserId';
import { processReactions } from './reactions';
import { processAttachments } from './attachments';
import { getMentionedUsers } from './getMentionedUsers';
import { sleep } from '@linen/utilities/promises';
import { parseSlackSentAt, tsToSentAt } from '@linen/serializers/sentAt';
import { findOrCreateThread } from 'services/threads';
import { slugify } from '@linen/utilities/string';
import { filterMessages, parseMessage } from './parseMessage';
import { FetchConversationsTypedFnType } from '../types';

async function saveMessagesTransaction({
  messages,
  channelId,
  users,
  token,
  logger,
  channelName,
}: {
  messages: ConversationHistoryMessage[];
  channelId: string;
  users: UserMap[];
  token: string;
  logger: Logger;
  channelName: string;
}) {
  if (!messages.length) return;
  logger.log({ channelName, 'saveMessagesTransaction startedAt': new Date() });

  for (const m of messages) {
    const thread = await findOrCreateThread({
      channelId,
      externalThreadId: m.ts,
      sentAt: parseSlackSentAt(m.ts),
      lastReplyAt: parseSlackSentAt(m.ts),
      slug: slugify(m.text),
      messageCount: (m.reply_count || 0) + 1,
    });
    let user: UserMap | undefined;
    if (!m.user && !!m.bot_id) {
      m.user = await getBotUserId(m.bot_id, token);
    }
    if (!!m.user) {
      user = users.find((u) => u.externalUserId === m.user);
    }

    const text = m.text as string;
    const mentionedUsers = getMentionedUsers(text, users);
    const serializedMessage = {
      body: m.text,
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
      processAttachments(m, message, token, logger),
    ]);
  }
  logger.log({ channelName, 'saveMessagesTransaction finishedAt': new Date() });
}

export async function fetchAllTopLevelMessages({
  channel,
  usersInDb,
  token,
  fullSync,
  fetchConversationsTyped,
  oldest,
  logger,
}: {
  channel: channels;
  account: AccountWithSlackAuthAndChannels;
  usersInDb: UserMap[];
  token: string;
  fullSync?: boolean | undefined;
  fetchConversationsTyped: FetchConversationsTypedFnType;
  oldest: string;
  logger: Logger;
}) {
  const c = channel;
  if (!c.externalChannelId) {
    return;
  }
  if (fullSync) {
    c.externalPageCursor = null;
  }
  const channelName = c.channelName;
  let nextCursor = c.externalPageCursor || undefined;
  let firstLoop = true;
  if (nextCursor === 'completed') {
    logger.log({
      channelName,
      syncing: 'skipped. externalPageCursor=completed',
    });
    return;
  }

  if (c.externalPageCursor) {
    try {
      let { channelCursor, threadCursor } = JSON.parse(c.externalPageCursor);
      // if threadCursor exist, it means that save-all-thread step (next step) was interrupted
      if (channelCursor === 'completed' || !!threadCursor) {
        logger.log({
          channelName,
          syncingTopLevel: 'skipped. channelCursor=completed',
        });
        return;
      }
      nextCursor = channelCursor;
    } catch (error) {}
  }
  let retries = 0;

  logger.log({
    channelName,
    'syncingTopLevel startedAt': new Date(),
  });
  //fetch all messages by paginating
  while (!!nextCursor || firstLoop) {
    logger.log({ channelName, nextCursor });
    try {
      const additionalConversations = await fetchConversationsTyped(
        c.externalChannelId,
        token,
        nextCursor,
        oldest
      );

      const additionalMessages =
        additionalConversations.messages
          ?.filter(filterMessages)
          .map(parseMessage) || [];
      //save all messages
      await saveMessagesTransaction({
        messages: additionalMessages,
        channelId: c.id,
        users: usersInDb,
        token,
        logger,
        channelName,
      });
      nextCursor = additionalConversations.response_metadata?.next_cursor;

      // save cursor in database so don't have
      //to refetch same conversation if script fails
      !!nextCursor &&
        (await updateNextPageCursor(
          c.id,
          JSON.stringify({ channelCursor: nextCursor })
        ));
    } catch (e) {
      logger.warn({
        channelName,
        'fetching messages failed': (e as Error).message || e,
      });
      await sleep(10000);
      retries += 1;
      if (retries > 3) {
        nextCursor = undefined;
        logger.error({ error: e });
      }
    }
    firstLoop = false;
  }
  await updateNextPageCursor(
    c.id,
    JSON.stringify({ channelCursor: 'completed' })
  );
  logger.log({ channelName, 'syncingTopLevel finishedAt': new Date() });
}
