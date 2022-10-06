import { NextApiRequest, NextApiResponse } from 'next/types';
import { channelIndex, findOrCreateChannel } from '../../lib/models';
import prisma from '../../client';
import { channels } from '@prisma/client';
import { withSentry } from '@sentry/nextjs';
import { v4 } from 'uuid';
import { getAuthFromSession } from 'utilities/session';

//example post body:
// {
//     "slack_channel_id": "C030HFK836C",
//     "channel_name": "Papercups"
//     "account_id": "aecb2deb-75a5-402e-8d0e-2585b8756e96"
// }

// example get query: /api/channels?account_id="aecb2deb-75a5-402e-8d0e-2585b8756e96"

async function toggleChannelVisibility({
  channelsIdToHide,
  channelsIdToShow,
  accountId,
}: {
  channelsIdToShow: string[];
  channelsIdToHide: string[];
  accountId: string;
}) {
  return await prisma.$transaction([
    prisma.channels.updateMany({
      where: {
        id: { in: channelsIdToHide },
        accountId,
      },
      data: {
        hidden: true,
      },
    }),
    prisma.channels.updateMany({
      where: {
        id: { in: channelsIdToShow },
        accountId,
      },
      data: {
        hidden: false,
      },
    }),
  ]);
}

type UpdateChannelVisibilityRequest = {
  channels: channels[];
  accountId: string;
};

function filterChannelsByHiddenField(channels: channels[], hidden: boolean) {
  return channels
    .filter((channel) => channel.hidden === hidden)
    .map(({ id }) => id);
}

function getHiddenChannelIds(channels: channels[]) {
  return filterChannelsByHiddenField(channels, true);
}

function getVisibleChannelIds(channels: channels[]) {
  return filterChannelsByHiddenField(channels, false);
}

async function update(body: UpdateChannelVisibilityRequest, accountId: string) {
  // TODO validate that the user in current session can update this account
  const { channels } = body;
  const channelsIdToHide = getHiddenChannelIds(channels);
  const channelsIdToShow = getVisibleChannelIds(channels);
  await toggleChannelVisibility({
    channelsIdToHide,
    channelsIdToShow,
    accountId,
  });
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getAuthFromSession(req, res);
  if (!user) {
    return res.status(401).end();
  }
  const accountId = user.accountId;
  if (!accountId) {
    return res.status(403).end();
  }

  const body = JSON.parse(req.body);
  if (req.method === 'PUT') {
    await update(body, accountId);
    return res.status(200).json({});
  }
  if (req.method === 'POST') {
    const channel = await findOrCreateChannel({
      externalChannelId: body.slack_channel_id || v4(),
      channelName: body.channel_name,
      accountId,
    });
    return res.status(200).json(channel);
  }
  if (req.method === 'GET') {
    const channels = await channelIndex(accountId);
    return res.status(200).json(channels);
  }
  return res.status(405).end();
}

export default withSentry(handler);
