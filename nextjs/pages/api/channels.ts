import { NextApiRequest, NextApiResponse } from 'next/types';
import { channelIndex, findOrCreateChannel } from '../../lib/models';
import prisma from '../../client';
import { channels } from '@prisma/client';
import { withSentry } from 'utilities/sentry';

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
}: {
  channelsIdToShow: string[];
  channelsIdToHide: string[];
}) {
  return await prisma.$transaction([
    prisma.channels.updateMany({
      where: {
        id: { in: channelsIdToHide },
      },
      data: {
        hidden: true,
      },
    }),
    prisma.channels.updateMany({
      where: {
        id: { in: channelsIdToShow },
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

async function update(request: NextApiRequest, response: NextApiResponse) {
  // TODO validate that the user in current session can update this account
  const body: UpdateChannelVisibilityRequest = JSON.parse(request.body);
  const { channels } = body;
  const channelsIdToHide = getHiddenChannelIds(channels);
  const channelsIdToShow = getVisibleChannelIds(channels);
  await toggleChannelVisibility({ channelsIdToHide, channelsIdToShow });
  return response.status(200).json({});
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    return update(req, res);
  }
  if (req.method === 'POST') {
    const externalChannelId = req.body.slack_channel_id;
    const channelName = req.body.channel_name;
    const accountId = req.body.account_id;

    const channel = await findOrCreateChannel({
      externalChannelId,
      channelName,
      accountId,
    });
    res.status(200).json(channel);
    return;
  } else {
    const accountId = req.query.account_id;
    const channels = await channelIndex(accountId as string);
    res.status(200).json(channels);
  }
}

const get = () => {};

export default withSentry(handler);
