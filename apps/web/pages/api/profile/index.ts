import { NextApiRequest, NextApiResponse } from 'next/types';
import Session from 'services/session';
import prisma from 'client';

interface CreateParams {
  displayName: string;
  userId: string;
  currentUserId: string;
}

export async function create({
  displayName,
  userId,
  currentUserId,
}: CreateParams) {
  if (!displayName) {
    return { status: 400 };
  }
  if (userId !== currentUserId) {
    return { status: 403 };
  }
  const users = await prisma.users.findMany({
    select: { id: true },
    where: { authsId: currentUserId },
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
    const { status, data } = await create({
      ...request.body,
      currentUserId: session.user.id,
    });
    return response.status(status).json(data || {});
  }
  return response.status(404).json({});
}
