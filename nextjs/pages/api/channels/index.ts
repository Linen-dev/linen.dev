import { NextApiRequest, NextApiResponse } from 'next/types';
import { findOrCreateChannel } from 'lib/models';
import { withSentry } from '@sentry/nextjs';
import { v4 } from 'uuid';
import PermissionsService from 'services/permissions';
import { createSlug } from 'utilities/util';
import ChannelsService from 'services/channels';
import prisma from 'client';

type Props = {
  communityId?: string;
  communityName?: string;
};

type PutProps = Props & {
  communityId: string;
  channels: any[];
};

type PostProps = Props & {
  communityId: string;
  slackChannelId?: string;
  channelName: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const body = JSON.parse(req.body);

  const { communityId }: Props = body;

  if (!communityId) {
    return res.status(400).end();
  }

  const permissions = await PermissionsService.get({
    request: req,
    response: res,
    params: {
      communityId,
    },
  });

  if (!permissions.manage) {
    return res.status(401).end();
  }

  if (req.method === 'PUT') {
    const { communityId, channels }: PutProps = body;
    await ChannelsService.updateChannelsVisibility(channels, communityId);
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { channelName, communityId, slackChannelId }: PostProps = body;

    const slug = createSlug(channelName);

    const result = await prisma.channels.findFirst({
      where: {
        channelName: slug,
        accountId: communityId,
      },
    });

    if (result) {
      return res
        .status(400)
        .json({ error: 'Channel with this name already exists' });
    }

    const channel = await findOrCreateChannel({
      externalChannelId: slackChannelId || v4(),
      channelName: slug,
      accountId: communityId,
    });
    return res.status(200).json(channel);
  }
  return res.status(405).end();
}

export default withSentry(handler);
