import { NextApiRequest, NextApiResponse } from 'next/types';
import { prisma } from '@linen/database';
import { serializeThread } from '@linen/serializers/thread';
import { serializeSettings } from '@linen/serializers/settings';

export async function index({ skip }: { skip: number }) {
  const threads = await prisma.threads.findMany({
    where: {
      channel: {
        account: {
          type: 'PUBLIC',
        },
      },
    },
    include: {
      messages: {
        include: {
          author: true,
          mentions: {
            include: {
              users: true,
            },
          },
          reactions: true,
          attachments: true,
        },
        orderBy: { sentAt: 'asc' },
      },
      channel: true,
    },
    orderBy: { lastReplyAt: 'desc' },
    skip: skip || 0,
    take: 10,
  });

  const accounts = await prisma.accounts.findMany({
    where: {
      id: { in: threads.map((thread) => thread.channel.accountId) as string[] },
    },
  });

  return {
    status: 200,
    data: {
      threads: threads.map(serializeThread),
      settings: accounts.map(serializeSettings),
    },
  };
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const skip = Number(request.query.skip);
  const { status, data } = await index({ skip });
  return response.status(status).json(data);
}
