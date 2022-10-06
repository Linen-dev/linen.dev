import { getCurrentUrl } from 'utilities/domain';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createInvitation, updateInvitation } from 'services/invites';
import type { Roles } from '@prisma/client';
import { getAuthFromSession, UserSession } from 'utilities/session';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const user = await getAuthFromSession(request, response);

  if (!user) {
    return response.status(401).end();
  }

  const host = getCurrentUrl(request);

  if (request.method === 'POST') {
    const { status, message } = await createInvite(user, request.body, host);
    return response.status(status).json({ message });
  }
  if (request.method === 'PUT') {
    const { status, message } = await updateInviteRole(
      user,
      request.body,
      host
    );
    return response.status(status).json({ message });
  }

  return response.status(405).end();
}

async function createInvite(
  user: UserSession,
  body: string,
  host: string
): Promise<{
  status: number;
  message: string;
}> {
  const {
    email,
    accountId,
    role,
  }: {
    email: string;
    accountId: string;
    role: Roles;
  } = JSON.parse(body);

  return await createInvitation({
    requesterEmail: user.email,
    email,
    accountId,
    host,
    role,
  });
}

async function updateInviteRole(
  user: UserSession,
  body: string,
  host: string
): Promise<{
  status: number;
  message: string;
}> {
  const {
    userId,
    role,
  }: {
    userId: string;
    role: Roles;
  } = JSON.parse(body);

  return await updateInvitation({
    requesterEmail: user.email,
    userId,
    role,
  });
}
