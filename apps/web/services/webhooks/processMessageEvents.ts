import {
  createMessageWithMentions,
  findMessageByChannelIdAndTs,
  deleteMessageWithMentions,
  deleteMessageFromThread,
} from 'lib/models';
import { findOrCreateThread, updateSlackThread } from 'lib/threads';
import { slugify } from '@linen/utilities/string';
import {
  accounts,
  channels,
  Prisma,
  slackAuthorizations,
} from '@linen/database';
import { MessageFormat, SlackEvent, SlackMessageEvent } from '@linen/types';
import { findOrCreateUserFromUserInfo } from 'lib/users';
import { parseSlackSentAt, tsToSentAt } from '@linen/serializers/sentAt';
import { findChannelWithAccountByExternalId } from 'lib/channel';
import { eventNewMessage, eventNewThread } from 'services/events';
import { processAttachments } from 'services/slack';
import { serializeMessage } from '@linen/serializers/message';
import { serializeThread } from '@linen/serializers/thread';
import { filterMessages, parseMessage } from 'services/slack/sync/parseMessage';

export async function processMessageEvent(body: SlackEvent) {
  const event = body.event as SlackMessageEvent;
  const channelId = event.channel;
  const teamId = body.team_id;
  const channel = await findChannelWithAccountByExternalId(channelId, teamId);

  if (channel === null) {
    console.error('Channel does not exist in db ');
    return { status: 404, error: 'Channel not found', metadata: { channelId } };
  }

  if (channel.account === null) {
    console.error('Account does not exist in db ');
    return { status: 404, error: 'Account not found', metadata: { teamId } };
  }

  if (!filterMessages(event)) {
    return 'Skip message by filter';
  }

  let message;
  if (
    event.type === 'message' &&
    event.subtype &&
    event.subtype === 'message_deleted'
  ) {
    message = await deleteMessage(channel, parseMessage(event));
  } else if (
    event.type === 'message' &&
    event.subtype &&
    event.subtype === 'message_changed'
  ) {
    message = await changeMessage(channel, parseMessage(event));
  } else {
    message = await addMessage(channel, parseMessage(event));
  }

  return {
    status: 200,
    ok: true,
    message,
  };
}

async function addMessage(
  channel: channels & {
    account: (accounts & { slackAuthorizations: slackAuthorizations[] }) | null;
  },
  event: SlackMessageEvent
) {
  const thread_ts = event.thread_ts || event.ts;
  const thread = await findOrCreateThread({
    externalThreadId: thread_ts,
    channelId: channel.id,
    sentAt: parseSlackSentAt(event.ts),
    lastReplyAt: parseSlackSentAt(event.ts),
    slug: slugify(event.text),
  });

  if (!!event.thread_ts) {
    thread.messageCount += 1;
    await updateSlackThread(thread.id, {
      messageCount: thread.messageCount,
    });
  }

  //TODO: create render text object and save that on creation of message
  // This way we don't have to fetch mentions on every message render
  let mentionUserIds = event.text.match(/<@(.*?)>/g) || [];
  let mentionUsersMap = mentionUserIds.map((m) =>
    m.replace('<@', '').replace('>', '')
  );
  const accessToken = channel.account?.slackAuthorizations[0]?.accessToken!;
  const mentionUsers = await Promise.all(
    mentionUsersMap.map((userId) =>
      findOrCreateUserFromUserInfo(userId, channel.accountId!, accessToken)
    )
  );

  const mentionIds = mentionUsers.filter(Boolean).map((x) => x!.id);

  let user = await findOrCreateUserFromUserInfo(
    event.bot_id || event.user,
    channel.accountId!,
    accessToken
  );

  const param: Prisma.messagesUncheckedCreateInput = {
    body: event.text,
    channelId: channel.id,
    sentAt: tsToSentAt(event.ts),
    threadId: thread?.id,
    externalMessageId: event.ts,
    usersId: user?.id,
    messageFormat: MessageFormat.SLACK,
  };

  const message = await createMessageWithMentions(param, mentionIds);

  if (accessToken) {
    await processAttachments(
      {
        files: event.files,
      } as any,
      message,
      accessToken
    );
  }

  const channelId = channel.id;
  const messageId = message.id;
  const threadId = thread.id;

  if (event.ts === event.thread_ts || !event.thread_ts) {
    // is a thread
    const serializedThread = serializeThread({
      ...thread,
      messages: [message],
    });
    await eventNewThread({
      communityId: channel.accountId!,
      channelId,
      messageId,
      threadId,
      imitationId: threadId,
      mentions: message.mentions,
      mentionNodes: [],
      thread: JSON.stringify(serializedThread),
      userId: user?.id,
    });
  } else if (!!event.thread_ts && event.ts !== event.thread_ts) {
    // is a reply
    const serializedMessage = serializeMessage(message);
    await eventNewMessage({
      communityId: channel.accountId!,
      channelId,
      messageId,
      threadId,
      imitationId: messageId,
      mentions: message.mentions,
      mentionNodes: [],
      message: JSON.stringify(serializedMessage),
      userId: user?.id,
    });
  }

  return message;
}

async function deleteMessage(
  channel: channels & {
    account: (accounts & { slackAuthorizations: slackAuthorizations[] }) | null;
  },
  event: SlackMessageEvent
) {
  if (event.deleted_ts) {
    const message = await findMessageByChannelIdAndTs(
      channel.id,
      event.deleted_ts
    );
    try {
      if (message) {
        await deleteMessageFromThread(message.id, message.threadId);
      }
    } catch (error) {
      console.warn('Message not found!', channel.id, event.deleted_ts);
    }
  }

  return {};
}

async function changeMessage(
  channel: channels & {
    account: (accounts & { slackAuthorizations: slackAuthorizations[] }) | null;
  },
  event: SlackMessageEvent
) {
  // First remove previous message
  if (event.previous_message) {
    const message = await findMessageByChannelIdAndTs(
      channel.id,
      event.previous_message.ts
    );
    try {
      message && (await deleteMessageWithMentions(message.id));
    } catch (error) {
      console.warn('Message not found!', channel.id, event.deleted_ts);
    }
  }

  let message = {};
  if (event.message) {
    message = await addMessage(channel, parseMessage(event.message));
  }

  return message;
}
