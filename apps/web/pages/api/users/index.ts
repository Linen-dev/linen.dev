import type { NextApiRequest, NextApiResponse } from 'next';
import type { Roles } from '@prisma/client';
import PermissionsService from 'services/permissions';
import UsersService from 'services/users';

type Props = { communityId: string };

type PutProps = Props & {
  userId: string;
  role: Roles;
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const body = JSON.parse(request.body);
  const permissions = await PermissionsService.get({
    request,
    response,
    params: {
      communityId: body.communityId,
    },
  });
  if (!permissions.manage) {
    return response.status(401).end();
  }

  if (request.method === 'PUT') {
    const { userId, role }: PutProps = body;
    await UsersService.updateUserRole({ userId, role });
    return response.status(200).end();
  }

  return response.status(405).end();
}
