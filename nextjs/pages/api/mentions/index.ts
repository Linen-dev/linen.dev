import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthFromSession } from 'utilities/session';
import prisma from 'client';
import serializeUser from 'serializers/user';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { accountId } = await getAuthFromSession(request, response);
  if (!accountId) {
    throw 'session without account';
  }

  if (request.method === 'GET') {
    const term = request.query.term as string;
    const condition = term
      ? { AND: [{ displayName: { search: term } }] }
      : null;
    const users = await prisma.users.findMany({
      where: {
        account: { id: accountId },
        ...condition,
      },
      take: 5,
    });
    return response.status(200).json(users.map(serializeUser));
  }

  return response.status(405).end();
}
