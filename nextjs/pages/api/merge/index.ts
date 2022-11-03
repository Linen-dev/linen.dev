import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from 'client';
import Permissions from 'services/permissions';
import CommunityService from 'services/community';
import { Permissions as PermissionsType } from 'types/shared';

export async function create({
  from,
  to,
  permissions,
  communityId,
}: {
  from: string;
  to: string;
  permissions: PermissionsType;
  communityId: string;
}) {
  if (!permissions.manage) {
    return { status: 401 };
  }

  if (!from || !to) {
    return { status: 400 };
  }

  const community = await CommunityService.find({ communityId });

  if (!community) {
    return { status: 404 };
  }

  const thread1 = await prisma.threads.findUnique({
    where: { id: from },
    include: { messages: true, channel: true },
  });
  const thread2 = await prisma.threads.findUnique({
    where: { id: to },
    include: { channel: true },
  });
  if (!thread1 || !thread2) {
    return {
      status: 404,
    };
  }

  if (
    thread1.channel.accountId !== communityId ||
    thread2.channel.accountId !== communityId
  ) {
    return { status: 403 };
  }

  const ids = thread1.messages.map((message) => message.id);

  await prisma.$transaction([
    prisma.messages.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        threadId: thread2.id,
      },
    }),
    prisma.threads.delete({
      where: {
        id: thread1.id,
      },
    }),
  ]);

  return {
    status: 200,
    data: {},
  };
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { communityId } = request.body;
  const permissions = await Permissions.get({
    request,
    response,
    params: { communityId },
  });

  if (request.method === 'POST') {
    const { from, to } = request.body;
    const { status, data } = await create({
      from,
      to,
      permissions,
      communityId,
    });
    return response.status(status).json(data || {});
  }
  return response.status(200).json({});
}
