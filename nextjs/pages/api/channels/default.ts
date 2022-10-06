import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../../client';
import { withSentry } from '@sentry/nextjs';
import PermissionsService from 'services/permissions';

type DefaultChannelRequest = {
  communityId: string;
  channelId: string;
  originalChannelId: string;
};

async function put(request: NextApiRequest, response: NextApiResponse) {
  const { communityId, channelId, originalChannelId }: DefaultChannelRequest =
    JSON.parse(request.body);
  const permissions = await PermissionsService.get({
    request,
    response,
    params: { communityId },
  });
  if (!permissions.manage) {
    return response.status(401).json({});
  }
  const transactions = [
    prisma.channels.update({
      where: {
        id: channelId,
      },
      data: {
        default: true,
      },
    }),
  ];

  if (originalChannelId) {
    transactions.push(
      prisma.channels.update({
        where: {
          id: originalChannelId,
        },
        data: {
          default: false,
        },
      })
    );
  }

  await prisma.$transaction(transactions);
  return response.status(200).json({});
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'PUT':
      return put(req, res);
    default:
      return res.status(404).json({});
  }
}

export default withSentry(handler);
