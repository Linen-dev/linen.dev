import { getCurrentUrl } from 'utilities/domain';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Roles } from '@prisma/client';
import { getAuthFromSession, UserSession } from 'utilities/session';
import * as userService from 'services/users';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const user = await getAuthFromSession(request, response);
  const host = getCurrentUrl(request);

  if (request.method === 'PUT') {
    await updateUserRole(user, request.body, host);
    return response.status(200).json({ message: 'user role updated' });
  }

  return response.status(405).end();
}

async function updateUserRole(user: UserSession, body: string, host: string) {
  const {
    userId,
    role,
  }: {
    userId: string;
    role: Roles;
  } = JSON.parse(body);

  return await userService.updateUserRole({
    requesterEmail: user.email,
    userId,
    role,
  });
}
