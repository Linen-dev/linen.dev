import type { NextApiRequest, NextApiResponse } from 'next';
import PermissionsService from 'services/permissions';
import UsersService from 'services/users';

type Props = { communityId: string };

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const body: Props = JSON.parse(request.body);
  const permissions = await PermissionsService.get({
    request,
    response,
    params: {
      communityId: body.communityId,
    },
  });

  if (!permissions.access) {
    return response.status(401).end();
  }

  if (!permissions.auth?.id) {
    return response.status(401).end();
  }

  if (request.method === 'POST') {
    await UsersService.updateTenant({
      accountId: body.communityId,
      authId: permissions.auth?.id,
    });
    return response.status(200).end();
  }

  return response.status(405).end();
}
