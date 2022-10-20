import { NextApiRequest, NextApiResponse } from 'next/types';
import Session from 'services/session';
import serializeUser from 'serializers/user';
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
  const user = await prisma.users.update({
    where: {
      id: currentUserId,
    },
    data: {
      displayName,
    },
  });
  return {
    status: 200,
    data: {
      user: serializeUser(user),
    },
  };
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'POST') {
    const user = await Session.user(request, response);
    if (!user) {
      return response.status(401).end({});
    }
    const { status, data } = await create({
      ...request.body,
      currentUserId: user.id,
    });
    return response.status(status).json(data || {});
  }
  return response.status(404).json({});
}
