import type { NextApiRequest, NextApiResponse } from 'next';
import PermissionsService from 'services/permissions';
import {
  acceptInvite,
  findInvitesByEmail,
  joinCommunity,
} from 'services/invites';
import { cors, preflight } from 'utilities/cors';

type Props = { communityId: string };
type PostProps = Props & {};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'OPTIONS') {
    return preflight(request, response, ['POST']);
  }
  cors(request, response);

  const { communityId }: PostProps = JSON.parse(request.body);

  const permissions = await PermissionsService.get({
    request,
    response,
    params: { communityId },
  });

  if (!permissions.access) {
    return response.status(401).json({});
  }

  if (request.method === 'POST') {
    const invites = await findInvitesByEmail(permissions.auth?.email!, {
      accountsId: communityId,
    });
    if (invites.length) {
      await acceptInvite(invites[0].id, permissions.auth?.email!);
    } else {
      await joinCommunity(
        permissions.auth?.email!,
        communityId,
        permissions.auth?.id!
      );
    }
    return response.status(200).json({});
  }

  return response.status(405).json({});
}
