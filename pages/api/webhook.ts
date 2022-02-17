import prisma from '../../client';

import type { NextApiRequest, NextApiResponse } from 'next';
import { createMessage, MessageParam } from '../../lib/slack';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const result = await handleWebhook(req.body);
  if (result.error) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.status(result.status).json({});
}

export const handleWebhook = async (body: any) => {
  const event = body.event;
  const channelId = body.event.channel;

  const channel = await prisma.channels.findUnique({
    where: {
      slackChannelId: channelId,
    },
  });

  if (channel === null) {
    console.error('Channel does not exist in db ');
    return { status: 403, error: 'Channel not found' };
  }

  const param: MessageParam = {
    body: event.text,
    channelId: channel.id,
    sentAt: new Date(parseFloat(event.ts) * 1000),
    slackThreadTs: event.ts,
  };

  const message = await createMessage(param);

  return {
    status: 200,
    message,
  };
};

export const findOrCreateChannel = async (
  channelId: string,
  channelName: string
) => {
  prisma.channels.upsert({
    where: {
      slackChannelId: channelId,
    },
    update: {},
    create: {
      slackChannelId: channelId,
      channelName: channelName,
    },
  });
};
