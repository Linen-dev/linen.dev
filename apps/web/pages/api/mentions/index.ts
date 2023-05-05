import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@linen/database';
import { serializeUser } from '@linen/serializers/user';
import PermissionsService from 'services/permissions';
import { cors, preflight } from 'utilities/cors';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'OPTIONS') {
    return preflight(request, response, ['GET']);
  }
  cors(request, response);

  if (!request.query.communityId) {
    return response.status(400).end();
  }
  const permissions = await PermissionsService.get({
    request,
    response,
    params: {
      communityId: request.query.communityId as string,
    },
  });

  if (!permissions.is_member) {
    return response.status(403).end();
  }

  if (request.method === 'GET') {
    const term = request.query.term as string;
    const users = await getMentions(term, request.query.communityId as string);
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
