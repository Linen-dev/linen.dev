import { NextApiRequest, NextApiResponse } from 'next/types';
import { findOrCreateChannel } from 'lib/models';
import { withSentry } from '@sentry/nextjs';
import { v4 } from 'uuid';
import PermissionsService from 'services/permissions';
import { createSlug } from 'utilities/util';
import ChannelsService from 'services/channels';

type Props = {
  communityId?: string;
  communityName?: string;
};

type PutProps = Props & {
  communityId: string;
  channels: any[];
};

type PostProps = Props & {
  communityId?: string;
  slack_channel_id?: string;
  channel_name: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const body = JSON.parse(req.body);

  const { communityId, communityName }: Props = body;

  const permissions = await PermissionsService.get({
    request: req,
    response: res,
    params: {
      communityId,
      communityName,
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
    const { channel_name, communityId, slack_channel_id }: PostProps = body;

    const channel = await findOrCreateChannel({
      externalChannelId: slack_channel_id || v4(),
      channelName: createSlug(channel_name),
      accountId: communityId || permissions.user?.accountId!,
    });
    res.status(200).json(channel);
    return res.end();
  }
  return res.status(405).end();
}

export default withSentry(handler);
