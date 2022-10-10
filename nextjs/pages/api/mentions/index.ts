import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from 'client';
import serializeUser from 'serializers/user';
import PermissionsService from 'services/permissions';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const permissions = await PermissionsService.get({
    request,
    response,
    params: {},
  });

  // we may check for chat permissions here
  // right now the users can only list users from same tenant

  if (request.method === 'GET') {
    const term = request.query.term as string;
    const users = await getMentions(term, permissions.user?.accountId!);
    response.status(200).json(users.map(serializeUser));
    return response.end();
  }

  return response.status(405).end();
}

async function getMentions(term: string, accountId: string) {
  const condition = term
    ? { displayName: { contains: term, mode: 'insensitive' } }
    : null;
  const users = await prisma.users.findMany({
    where: {
      account: { id: accountId },
      ...condition,
    } as any,
    take: 5,
  });
  return users;
}
