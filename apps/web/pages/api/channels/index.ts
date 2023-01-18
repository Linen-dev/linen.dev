import { NextApiRequest, NextApiResponse } from 'next/types';
import { v4 } from 'uuid';
import PermissionsService from 'services/permissions';
import { patterns } from 'utilities/util';
import ChannelsService from 'services/channels';
import prisma from 'client';
import { z } from 'zod';

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
    return res.status(400).json({});
  }

  const permissions = await PermissionsService.get({
    request: req,
    response: res,
    params: {
      communityId,
    },
  });

  if (!permissions.manage) {
    return res.status(401).json({});
  }

  if (req.method === 'PUT') {
    const { communityId, channels }: PutProps = body;
    await ChannelsService.updateChannelsVisibility(channels, communityId);
    return res.status(200).json({});
  }

  if (req.method === 'POST') {
    const { channelName, communityId, slackChannelId }: PostProps = body;

    if (
      !z.string().regex(patterns.channelName).safeParse(channelName).success
    ) {
      return res.status(400).json({
        error: 'Channel must have the pattern: ' + patterns.channelName.source,
      });
    }

    const result = await prisma.channels.findFirst({
      where: {
        channelName,
        accountId: communityId,
      },
    });

    if (result) {
      return res
        .status(400)
        .json({ error: 'Channel with this name already exists' });
    }

    const channel = await ChannelsService.findOrCreateChannel({
      externalChannelId: slackChannelId || v4(),
      channelName,
      accountId: communityId,
    });
    return res.status(200).json(channel);
  }
  return res.status(405).json({});
}

export default handler;
