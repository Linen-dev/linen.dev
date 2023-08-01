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

async function saveMessagesTransaction(
  messages: ConversationHistoryMessage[],
  channelId: string,
  users: UserMap[],
  token: string,
  logger: Logger
) {
  if (!messages.length) return;
  logger.log({ 'saveMessagesTransaction startAt': new Date() });

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
  logger.log({ 'saveMessagesTransaction finishedAt': new Date() });
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
  logger.log({ 'Syncing channel': c.channelName });
  let nextCursor = c.externalPageCursor || undefined;
  let firstLoop = true;
  if (nextCursor === 'completed') {
    logger.log({ 'channel completed syncing': c.channelName });
    return;
  }
  let retries = 0;

  //fetch all messages by paginating
  while (!!nextCursor || firstLoop) {
    logger.log({ 'Messages cursor': nextCursor });
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
      logger.log({ 'messages.length': additionalMessages.length });
      //save all messages
      await saveMessagesTransaction(
        additionalMessages,
        c.id,
        usersInDb,
        token,
        logger
      );
      nextCursor = additionalConversations.response_metadata?.next_cursor;

      // save cursor in database so don't have
      //to refetch same conversation if script fails
      !!nextCursor && (await updateNextPageCursor(c.id, nextCursor));
    } catch (e) {
      logger.warn({ 'fetching messages failed': (e as Error).message || e });
      await sleep(10000);
      retries += 1;
      if (retries > 3) {
        nextCursor = undefined;
        logger.error({ error: e });
      }
    }
    firstLoop = false;
  }
  await updateNextPageCursor(c.id, 'completed');
  logger.log({ 'channel completed syncing': c.channelName });
}
