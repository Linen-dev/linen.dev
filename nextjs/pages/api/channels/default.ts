import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../../client';
import { withSentry } from 'utilities/sentry';

type DefaultChannelRequest = {
  channelId: string;
  originalChannelId: string;
};

async function setDefaultChannel({
  channelId,
  originalChannelId,
}: DefaultChannelRequest) {
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

  return await prisma.$transaction(transactions);
}

async function put(req: NextApiRequest, res: NextApiResponse) {
  // TODO: validate that the user in current session can update this account
  const body: DefaultChannelRequest = JSON.parse(req.body);
  await setDefaultChannel(body);
  return res.status(200).json({});
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
