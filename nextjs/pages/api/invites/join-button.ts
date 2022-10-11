import type { NextApiRequest, NextApiResponse } from 'next';
import PermissionsService from 'services/permissions';
import {
  acceptInvite,
  findInvitesByEmail,
  joinCommunity,
} from 'services/invites';

type Props = { communityId: string };
type PostProps = Props & {};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { communityId }: PostProps = JSON.parse(request.body);

  const permissions = await PermissionsService.get({
    request,
    response,
    params: { communityId },
  });

  if (!permissions.access) {
    return response.status(401).end();
  }

  if (request.method === 'POST') {
    const invites = await findInvitesByEmail(permissions.user?.email!, {
      accountsId: communityId,
    });
    if (invites.length) {
      await acceptInvite(invites[0].id, permissions.user?.email!);
    } else {
      await joinCommunity(
        permissions.user?.email!,
        communityId,
        permissions.user?.authId!
      );
    }
    return response.status(200).end();
  }

  return response.status(405).end();
}
