import { getCurrentUrl } from 'utilities/domain';
import type { NextApiRequest, NextApiResponse } from 'next';
import { type Session, unstable_getServerSession } from 'next-auth';
import {
  acceptInvite,
  createInvitation,
  getOneInviteByUser,
} from 'services/invites';
import { authOptions } from './auth/[...nextauth]';
import type { Roles } from '@prisma/client';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const session = await unstable_getServerSession(
    request,
    response,
    authOptions
  );
  const host = getCurrentUrl(request);

  if (request.method === 'POST') {
    const { status, message } = await post(session, request.body, host);
    return response.status(status).json({ message });
  }

  if (request.method === 'GET') {
    const { status, message } = await get(session);
    return response.status(status).json(message);
  }

  if (request.method === 'PUT') {
    const { status, message } = await update(session, request.body);
    return response.status(status).json({ message });
  }

  return response.status(404);
}

async function post(
  session: Session | null,
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

  if (!session?.user?.email) {
    return { status: 401, message: 'unauthorized' };
  }

  return await createInvitation({
    requesterEmail: session.user.email,
    email,
    accountId,
    host,
    role,
  });
}

async function get(session: Session | null): Promise<{
  status: number;
  message?: any;
}> {
  if (!session?.user?.email) {
    return { status: 401, message: 'unauthorized' };
  }
  const invites = await getOneInviteByUser(session.user.email);
  return {
    status: 200,
    message: invites,
  };
}

async function update(
  session: Session | null,
  body: any
): Promise<{
  status: number;
  message: string;
}> {
  if (!session?.user?.email) {
    return { status: 401, message: 'unauthorized' };
  }
  const { id } = JSON.parse(body);
  return await acceptInvite(id, session.user.email);
}
