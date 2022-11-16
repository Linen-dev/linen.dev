import { NextApiRequest, NextApiResponse } from 'next/types';
import { channelNextPage } from 'services/channel';
import PermissionsService from 'services/permissions';

type GetProps = {
  channelId: string;
  cursor: string;
};

async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'GET') {
    if (!request.query.channelId || !request.query.cursor) {
      return response.status(404).json({});
    }
    const { channelId, cursor } = request.query as GetProps;
    const permissions = await PermissionsService.getAccessChannel({
      request,
      response,
      channelId,
    });
    if (!permissions.access) {
      return response.status(403).json({});
    }
    if (!permissions.can_access_channel) {
      return response.status(403).json({});
    }
    const result = await channelNextPage(channelId, cursor);
    return response.status(200).json(result);
  }
  return response.status(405).json({});
}

export default handler;
