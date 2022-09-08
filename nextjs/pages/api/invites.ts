import { getCurrentUrl } from 'utilities/domain';
import type { NextApiRequest, NextApiResponse } from 'next';
import { type Session, unstable_getServerSession } from 'next-auth';
import { createInvitation } from 'services/invites';
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
