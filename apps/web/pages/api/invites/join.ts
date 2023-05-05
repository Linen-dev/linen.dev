import type { NextApiRequest, NextApiResponse } from 'next';
import { acceptInvite } from 'services/invites';
import PermissionsService from 'services/permissions';
import { cors, preflight } from 'utilities/cors';

type Props = { communityId: string };

type PostProps = Props & {
  inviteId: string;
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'OPTIONS') {
    return preflight(request, response, ['POST']);
  }
  cors(request, response);

  const permissions = await PermissionsService.get({
    request,
    response,
    params: {},
  });
  if (!permissions.auth?.email) {
    return response.status(401).json({});
  }

  if (request.method === 'POST') {
    const { inviteId }: PostProps = JSON.parse(request.body);
    await acceptInvite(inviteId, permissions.auth?.email);
    return response.status(200).json({});
  }

  return response.status(405).json({});
}
