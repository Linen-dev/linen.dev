import { NextApiRequest, NextApiResponse } from 'next/types';
import { prisma } from '@linen/database';
import PermissionsService from 'services/permissions';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'GET') {
    const { communityId } = request.query;
    if (typeof communityId !== 'string') {
      return response.status(400).end();
    }

    const permissions = await PermissionsService.get({
      request,
      response,
      params: { communityId },
    });

    if (!permissions.manage) {
      return response.status(401).json({});
    }

    const members = await prisma.users.count({
      where: { accountsId: communityId },
    });
    return response.status(200).json({
      members,
    });
  }
  return response.status(404).json({});
}
