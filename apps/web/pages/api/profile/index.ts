import { NextApiRequest, NextApiResponse } from 'next/types';
import Session from 'services/session';
import prisma from 'client';

interface CreateParams {
  displayName: string;
  authId: string;
}

export async function update({ displayName, authId }: CreateParams) {
  if (!displayName || typeof displayName !== 'string') {
    return { status: 400 };
  }
  const users = await prisma.users.findMany({
    select: { id: true },
    where: { authsId: authId },
  });

  await prisma.users.updateMany({
    where: {
      id: { in: users.map((u) => u.id) },
    },
    data: {
      displayName,
    },
  });
  return {
    status: 200,
    data: { ok: true },
  };
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'PUT') {
    const session = await Session.find(request, response);
    if (!session?.user) {
      return response.status(401).end({});
    }
    const { status, data } = await update({
      ...request.body,
      authId: session.user.id,
    });
    return response.status(status).json(data || {});
  }
  return response.status(404).json({});
}
