import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthFromSession } from 'utilities/session';
import prisma from 'client';
import serializeUser from 'serializers/user';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const user = await getAuthFromSession(request, response);
  if (!user) {
    return response.status(401).end();
  }

  if (request.method === 'GET') {
    const term = request.query.term as string;
    const condition = term
      ? { displayName: { contains: term, mode: 'insensitive' } }
      : null;
    const users = await prisma.users.findMany({
      where: {
        account: { id: user.accountId },
        ...condition,
      } as any,
      take: 5,
    });
    return response.status(200).json(users.map(serializeUser));
  }

  return response.status(405).end();
}
