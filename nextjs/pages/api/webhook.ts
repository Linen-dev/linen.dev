import prisma from '../../client';

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createMessageWithMentions,
  findMessageByChannelIdAndTs,
  deleteMessageWithMentions,
  findAccountBySlackTeamId,
} from '../../lib/models';
import { findOrCreateThread, updateSlackThread } from '../../lib/threads';
import {
  SlackEvent,
  SlackMessageEvent,
  SlackMessageReactionRemovedEvent,
  SlackMessageReactionAddedEvent,
  SlackTeamJoinEvent,
  SlackChannelCreatedEvent,
  SlackChannelRenameEvent,
  UserProfileUpdateEvent,
} from '../../types/slackResponses/slackMessageEventInterface';
import { createSlug } from '../../lib/util';
import {
  accounts,
  channels,
  Prisma,
  slackAuthorizations,
} from '@prisma/client';
import {
  createChannel,
  findChannelByExternalId,
  renameChannel,
} from '../../lib/channel';
import { findAccountIdByExternalId } from '../../lib/account';
import {
  createUserFromUserInfo,
  findOrCreateUserFromUserInfo,
  findUser,
  updateUserFromUserInfo,
} from '../../lib/users';
import { parseSlackSentAt, tsToSentAt } from '../../utilities/sentAt';

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
  } else if (body.event.type === 'reaction_added') {
    return processMessageReactionAddedEvent(
      body.event as SlackMessageReactionAddedEvent
    );
  } else if (body.event.type === 'reaction_removed') {
    return processMessageReactionRemovedEvent(
      body.event as SlackMessageReactionRemovedEvent
    );
  } else if (body.event.type === 'channel_created') {
    return processChannelCreated(body);
  } else if (body.event.type === 'channel_rename') {
    return processChannelRename(body);
  } else if (body.event.type === 'user_profile_changed') {
    return processUserProfileChanged(body);
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
  const channel = await getChannel(channelId);

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
  const thread_ts = event.thread_ts || event.ts;
  const thread = await findOrCreateThread({
    externalThreadId: thread_ts,
    channelId: channel.id,
    sentAt: parseSlackSentAt(event.ts),
    slug: createSlug(event.text),
  });

  if (!!event.thread_ts) {
    thread.messageCount += 1;
    await updateSlackThread(thread.id, {
      messageCount: thread.messageCount,
    });
  }

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
    blocks: event.blocks as any,
    channelId: channel.id,
    sentAt: tsToSentAt(event.ts),
    threadId: thread?.id,
    externalMessageId: event.ts,
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

async function getChannel(channelId: string) {
  return await prisma.channels.findUnique({
    where: {
      externalChannelId: channelId,
    },
    include: {
      account: {
        include: {
          slackAuthorizations: true,
        },
      },
    },
  });
}

async function processMessageReactionEvent(
  event: SlackMessageReactionAddedEvent | SlackMessageReactionRemovedEvent
) {
  const channelId = event.item.channel;
  const channel = await getChannel(channelId);

  if (channel === null || channel.account === null) {
    console.error('Channel does not exist in db ');
    return { status: 403, error: 'Channel not found' };
  }

  const message = await prisma.messages.findUnique({
    where: {
      channelId_externalMessageId: {
        channelId: channel.id,
        externalMessageId: event.item.ts,
      },
    },
  });

  if (!message) {
    return {
      status: 404,
      error: 'Message not found',
    };
  }

  const whereClause =
    Prisma.validator<Prisma.messageReactionsWhereUniqueInput>()({
      messagesId_name: {
        messagesId: message.id,
        name: event.reaction,
      },
    });

  const reaction = await prisma.messageReactions.findUnique({
    where: whereClause,
  });

  console.log('reaction', reaction);

  return { reaction, whereClause, message };
}

async function processMessageReactionAddedEvent(
  event: SlackMessageReactionAddedEvent
) {
  const { error, status, reaction, whereClause, message } =
    await processMessageReactionEvent(event);

  if (error) {
    return { error, status };
  }

  const users = [event.user as Prisma.JsonValue];
  if (reaction) {
    // update
    if (reaction.users && Array.isArray(reaction.users)) {
      users.push(...(reaction.users as Prisma.JsonArray));
    }
    await prisma.messageReactions.update({
      data: {
        users,
        count: { increment: 1 },
      },
      where: whereClause,
    });
  } else {
    // create
    await prisma.messageReactions.create({
      data: {
        users,
        count: 1,
        messagesId: message?.id,
        name: event.reaction,
      },
    });
  }

  return { status: 200, message: 'Reaction added' };
}

async function processMessageReactionRemovedEvent(
  event: SlackMessageReactionRemovedEvent
) {
  const { error, status, reaction, whereClause } =
    await processMessageReactionEvent(event);

  if (error) {
    return { error, status };
  }

  if (reaction) {
    // update
    if (reaction.users && Array.isArray(reaction.users)) {
      const users = [...(reaction.users as Prisma.JsonArray)].filter((user) => {
        return user !== event.user;
      });
      await prisma.messageReactions.update({
        data: {
          users,
          count: { decrement: 1 },
        },
        where: whereClause,
      });
    }
  }

  return { status: 200, message: 'Reaction removed' };
}

async function processChannelCreated(body: SlackEvent) {
  const teamId = body.team_id;
  const event = body.event as SlackChannelCreatedEvent;
  const account = await findAccountIdByExternalId(teamId);
  if (!account) return { status: 404, error: 'account not found' };
  await createChannel({
    accountId: account.id,
    name: event.channel.name,
    externalChannelId: event.channel.id,
    hidden: false,
  });
  return { status: 200, message: 'channel created' };
}

async function processChannelRename(body: SlackEvent) {
  const teamId = body.team_id;
  const event = body.event as SlackChannelRenameEvent;
  const account = await findAccountIdByExternalId(teamId);
  if (!account) return { status: 404, error: 'account not found' };
  const channel = await findChannelByExternalId({
    accountId: account.id,
    externalId: event.channel.id,
  });
  if (!channel) {
    return processChannelCreated(body);
  }
  await renameChannel({ name: event.channel.name, id: channel.id });
  return { status: 200, message: 'channel renamed' };
}

async function processUserProfileChanged(body: SlackEvent) {
  const teamId = body.team_id;
  const event = body.event as UserProfileUpdateEvent;
  const account = await findAccountIdByExternalId(teamId);
  if (!account) return { status: 404, error: 'account not found' };
  const user = await findUser(event.user.id, account.id);
  if (!user) {
    await createUserFromUserInfo(event.user, account.id);
  } else {
    await updateUserFromUserInfo(user, event.user, account.id);
  }
  return { status: 200, message: 'user profile updated' };
}
