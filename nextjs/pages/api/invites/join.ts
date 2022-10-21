import type { NextApiRequest, NextApiResponse } from 'next';
import { acceptInvite } from 'services/invites';
import PermissionsService from 'services/permissions';

type Props = { communityId: string };

type PostProps = Props & {
  inviteId: string;
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const permissions = await PermissionsService.get({
    request,
    response,
    params: {},
  });
  if (!permissions.auth?.email) {
    return response.status(401).end();
  }

  if (request.method === 'POST') {
    const { inviteId }: PostProps = JSON.parse(request.body);
    await acceptInvite(inviteId, permissions.auth?.email);
    return response.status(200).end();
  }

  return response.status(405).end();
}
