import prisma from '../../client';

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createMessageWithMentions,
  createUserFromUserInfo,
  findOrCreateThread,
  findUser,
  updateSlackThread,
} from '../../lib/models';
import {
  Event,
  SlackMessageEvent,
} from '../../types/slackResponses/slackMessageEventInterface';
import { getSlackUser } from './slack';
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

  if (channel === null || channel.account === null) {
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

  const mentionIds = mentionUsers.filter(Boolean).map((x) => x!.id);

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
