import { NextApiRequest, NextApiResponse } from 'next/types';
import PermissionsService from 'services/permissions';
import ChannelsService from 'services/channels';

type Props = {
  communityId: string;
};

type PutProps = Props & {
  channelId: string;
  originalChannelId: string;
};

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const body = JSON.parse(request.body);
  const { communityId }: Props = body;
  const permissions = await PermissionsService.get({
    request,
    response,
    params: { communityId },
  });

  if (!permissions.manage) {
    return response.status(401).json({});
  }

  switch (request.method) {
    case 'PUT':
      const { channelId, originalChannelId }: PutProps = body;
      const { status } = await ChannelsService.setDefaultChannel(
        channelId,
        originalChannelId
      );
      return response.status(status).json({});
    default:
      return response.status(405).json({});
  }
}

export default handler;
