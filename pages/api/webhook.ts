import prisma from '../../client';

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createMessageWithMentions,
  createUserFromUserInfo,
  findOrCreateThread,
  findUser,
  updateSlackThread,
  findMessageByChannelIdAndTs,
  deleteMessageWithMentions,
} from '../../lib/models';
import {
  Event,
  SlackMessageEvent,
} from '../../types/slackResponses/slackMessageEventInterface';
import { getSlackUser } from './slack';
import { createSlug } from '../../lib/util';
import { accounts, channels, slackAuthorizations } from '@prisma/client';
import { add } from 'husky';

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

export const handleWebhook = async (body: SlackMessageEvent) => {
  const event: Event = body.event;
  const channelId = body.event.channel;
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

  console.log('######## WEBHOOK EVENT #########', event);

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
    console.error('Event not supported!!');
  }
  return {
    status: 200,
    message,
  };
};

async function findOrCreateUser(
  slackUserId: string,
  channel: channels & {
    account: (accounts & { slackAuthorizations: slackAuthorizations[] }) | null;
  }
) {
  let user = await findUser(slackUserId);
  if (user === null) {
    const accessToken = channel.account?.slackAuthorizations[0]?.accessToken;
    if (!!accessToken) {
      const slackUser = await getSlackUser(slackUserId, accessToken);
      //check done above in channel check
      user = await createUserFromUserInfo(slackUser, channel.accountId!);
    }
  }
  return user;
}

async function addMessage(
  channel: channels & {
    account: (accounts & { slackAuthorizations: slackAuthorizations[] }) | null;
  },
  event: Event
) {
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

  await updateSlackThread(thread.id, {
    messageCount: thread.messageCount,
    slug: thread.slug,
  });

  //TODO: create render text object and save that on creation of message
  // This way we don't have to fetch mentions on every message render

  //TODO: replace with blocks in elements
  let mentionUserIds = event.text.match(/<@(.*?)>/g) || [];
  mentionUserIds = mentionUserIds.map((m) =>
    m.replace('<@', '').replace('>', '')
  );
  const mentionUsers = await Promise.all(
    mentionUserIds.map((userId) => findOrCreateUser(userId, channel))
  );

  const mentionIds = mentionUsers.filter((x) => x).map((x) => x!.id);

  let user = await findOrCreateUser(event.user, channel);

  const param = {
    body: event.text,
    channelId: channel.id,
    sentAt: new Date(parseFloat(event.ts) * 1000),
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
  event: Event
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
  event: Event
) {
  console.log('changeMessage is not implemented yet!');

  return {};
}
