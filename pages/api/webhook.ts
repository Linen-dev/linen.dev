import prisma from '../../client';

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createMessageWithMentions,
  findOrCreateThread,
  updateSlackThread,
  findOrCreateUserFromUserInfo,
  findMessageByChannelIdAndTs,
  deleteMessageWithMentions,
  createUserFromUserInfo,
  findAccountBySlackTeamId,
  findUser,
} from '../../lib/models';
import {
  SlackEvent,
  SlackMessageEvent,
  SlackTeamJoinEvent,
} from '../../types/slackResponses/slackMessageEventInterface';
import { createSlug } from '../../lib/util';
import { accounts, channels, slackAuthorizations } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!!req.body.challenge) {
    res.status(200).json(req.body.challenge);
    return;
  }

  const result = await handleWebhook(req.body);
  if (result.error) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.status(result.status).json({});
}

export const handleWebhook = async (
  body: SlackEvent
): Promise<{ status: number; error?: string; message?: any }> => {
  if (body.event.type === 'team_join') {
    return processTeamJoin(body.event as SlackTeamJoinEvent);
  } else if (body.event.type === 'message') {
    return processMessageEvent(body.event as SlackMessageEvent);
  } else {
    console.error('Event not supported!!');
    return {
      status: 404,
      error: 'Event not supported',
    };
  }
};

async function processMessageEvent(event: SlackMessageEvent) {
  const channelId = event.channel;
  const channel = await prisma.channels.findUnique({
    where: {
      slackChannelId: channelId,
    },
    include: {
      account: {
        include: {
          slackAuthorizations: true,
        },
      },
    },
  });

  if (channel === null || channel.account === null) {
    console.error('Channel does not exist in db ');
    return { status: 403, error: 'Channel not found' };
  }

  let message;
  if (event.type === 'message' && !event.subtype) {
    message = await addMessage(channel, event);
  } else if (
    event.type === 'message' &&
    event.subtype &&
    event.subtype === 'message_deleted'
  ) {
    message = await deleteMessage(channel, event);
  } else if (
    event.type === 'message' &&
    event.subtype &&
    event.subtype === 'message_changed'
  ) {
    message = await changeMessage(channel, event);
  } else {
    console.error('Event not supported!!', event.type, event.subtype);
  }

  return {
    status: 200,
    message,
  };
}

async function addMessage(
  channel: channels & {
    account: (accounts & { slackAuthorizations: slackAuthorizations[] }) | null;
  },
  event: SlackMessageEvent
) {
  // Check if user is marked deleted
  const checkUser = await findUser(event.user, channel.accountId as string);
  if (checkUser && checkUser.deletedAt) {
    console.warn('User deleted!', channel.id, event.user);
    return {};
  }

  const thread_ts = event.thread_ts || event.ts;
  const thread = await findOrCreateThread({
    slackThreadTs: thread_ts,
    channelId: channel.id,
  });

  if (!!event.thread_ts) {
    thread.messageCount += 1;
  } else {
    //create slug based on the first message
    thread.slug = createSlug(event.text);
  }

  // maybe here, if threads.slug is null, will persist null
  await updateSlackThread(thread.id, {
    messageCount: thread.messageCount,
    ...(!!thread.slug && { slug: thread.slug }),
  });

  //TODO: create render text object and save that on creation of message
  // This way we don't have to fetch mentions on every message render

  //TODO: replace with blocks in elements
  let mentionUserIds = event.text.match(/<@(.*?)>/g) || [];
  mentionUserIds = mentionUserIds.map((m) =>
    m.replace('<@', '').replace('>', '')
  );
  const mentionUsers = await Promise.all(
    mentionUserIds.map((userId) =>
      findOrCreateUserFromUserInfo(userId, channel)
    )
  );

  const mentionIds = mentionUsers.filter(Boolean).map((x) => x!.id);

  let user = await findOrCreateUserFromUserInfo(event.user, channel);

  const param = {
    body: event.text,
    channelId: channel.id,
    sentAt: new Date(parseFloat(event.ts) * 1000),
    updatedAt: event.edited
      ? new Date(parseFloat(event.edited.ts) * 1000)
      : undefined,
    slackThreadId: thread?.id,
    slackMessageId: event.ts,
    usersId: user?.id,
  };

  const message = await createMessageWithMentions(param, mentionIds);

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
    if (message) {
      await deleteMessageWithMentions(message.id);
    } else {
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
    // Check if user is marked deleted
    const checkUser = await findUser(
      event.previous_message.user,
      channel.accountId as string
    );
    if (checkUser && checkUser.deletedAt) {
      console.warn('User deleted!', channel.id, event.previous_message.user);
      return {};
    }

    const message = await findMessageByChannelIdAndTs(
      channel.id,
      event.previous_message.ts
    );
    if (message) {
      await deleteMessageWithMentions(message.id);
    } else {
      console.warn('Message not found!', channel.id, event.deleted_ts);
    }
  }

  let message = {};
  if (event.message) {
    message = await addMessage(channel, event.message);
  }

  return message;
}

async function processTeamJoin(event: SlackTeamJoinEvent) {
  const team_id = event.user.team_id;
  // find account by slack team id
  const account = await findAccountBySlackTeamId(team_id);
  if (!account?.id) {
    return {
      status: 404,
      message: 'Account not found',
    };
  }
  await createUserFromUserInfo(event.user, account.id);
  return {
    status: 201,
    message: 'User created',
  };
}
