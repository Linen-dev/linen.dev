import type { NextApiRequest, NextApiResponse } from 'next';
import type { Roles } from '@prisma/client';
import { getAuthFromSession, UserSession } from 'utilities/session';
import * as userService from 'services/users';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const requester = await getAuthFromSession(request, response);

  if (!requester) {
    return response.status(401).end();
  }

  if (request.method === 'PUT') {
    await updateUserRole(requester, request.body);
    return response.status(200).json({ message: 'user role updated' });
  }

  return response.status(405).end();
}

async function updateUserRole(requester: UserSession, body: string) {
  const {
    userId,
    role,
  }: {
    userId: string;
    role: Roles;
  } = JSON.parse(body);

  return await userService.updateUserRole({
    requesterEmail: requester.email,
    userId,
    role,
  });
}
