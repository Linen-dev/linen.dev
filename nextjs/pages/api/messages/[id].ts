import { NextApiRequest, NextApiResponse } from 'next/types';
import { findMessageById } from 'lib/messages';
import serializeMessage from 'serializers/message';
import PermissionsService from 'services/permissions';

async function get(request: NextApiRequest, response: NextApiResponse) {
  const id = request.query.id as string;

  const message = await findMessageById({ id });
  if (!message) {
    return response.status(404).end();
  }
  if (!message.channel.accountId) {
    return response.status(401).end();
  }

  const permissions = await PermissionsService.get({
    request,
    response,
    params: {
      communityId: message.channel.accountId,
    },
  });
  if (!permissions.access) {
    return response.status(401).end();
  }

  response.status(200).json(serializeMessage(message));
  return response.end();
}

async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'GET') {
    return get(request, response);
  }
  return response.status(405).end();
}

export default handler;
