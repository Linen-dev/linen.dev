import prisma from '../../client';

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createMessage,
  createUserFromUserInfo,
  findOrCreateThread,
  findUser,
  updateSlackThread,
} from '../../lib/models';
import { SlackMessageEvent } from '../../interfaces/slackMessageEventInterface';
import { getSlackUser } from './slack';
import { createSlug } from '../../lib/util';

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
  const event = body.event;
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

  if (channel === null) {
    console.error('Channel does not exist in db ');
    return { status: 403, error: 'Channel not found' };
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

  await updateSlackThread(thread);
  let user = await findUser(event.user);
  if (user === null) {
    const accessToken = channel.account?.slackAuthorizations[0]?.accessToken;
    if (!!accessToken) {
      const slackUser = await getSlackUser(event.user, accessToken);
      user = await createUserFromUserInfo(slackUser, channel.accountId);
    }
  }

  const param = {
    body: event.text,
    channelId: channel.id,
    sentAt: new Date(parseFloat(event.ts) * 1000),
    slackThreadId: thread?.id,
    slackMessageId: event.ts,
    usersId: user?.id,
  };

  const message = await createMessage(param);

  return {
    status: 200,
    message,
  };
};
