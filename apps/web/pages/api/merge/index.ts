import { NextApiRequest, NextApiResponse } from 'next/types';
import { prisma } from '@linen/database';
import Permissions from 'services/permissions';
import CommunityService from 'services/community';
import { Permissions as PermissionsType } from '@linen/types';
import { cors, preflight } from 'utilities/cors';

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
  if (!from || !to) {
    return { status: 400 };
  }

  const community = await CommunityService.find({ communityId });

  if (!community) {
    return { status: 404 };
  }

  const thread1 = await prisma.threads.findUnique({
    where: { id: from },
    include: {
      messages: {
        orderBy: {
          sentAt: 'asc',
        },
      },
      channel: true,
    },
  });
  const thread2 = await prisma.threads.findUnique({
    where: { id: to },
    include: {
      messages: {
        orderBy: {
          sentAt: 'asc',
        },
      },
      channel: true,
    },
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

  if (!permissions.user) {
    return { status: 403 };
  }

  const message1 = thread1.messages[0];
  const message2 = thread1.messages[0];

  if (!message1 || !message2) {
    return { status: 404 };
  }

  const owner =
    message1.usersId === permissions.user.id &&
    message2.usersId === permissions.user.id;

  if (permissions.manage || owner) {
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
  } else {
    return { status: 401 };
  }
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'OPTIONS') {
    return preflight(request, response, ['POST']);
  }
  cors(request, response);
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
  return response.status(405).json({});
}
