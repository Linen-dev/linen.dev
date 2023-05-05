import { NextApiRequest, NextApiResponse } from 'next/types';
import { prisma } from '@linen/database';
import Permissions from 'services/permissions';
import CommunityService from 'services/community';
import { Permissions as PermissionsType } from '@linen/types';
import { cors, preflight } from 'utilities/cors';

export async function create({
  messageId,
  threadId,
  communityId,
  permissions,
}: {
  messageId: string;
  threadId: string;
  communityId: string;
  permissions: PermissionsType;
}) {
  if (!messageId || !threadId) {
    return { status: 400 };
  }

  const community = await CommunityService.find({ communityId });

  if (!community) {
    return { status: 404 };
  }

  const message = await prisma.messages.findUnique({
    where: { id: messageId },
    include: { channel: true, threads: true },
  });
  const thread = await prisma.threads.findUnique({
    where: { id: threadId },
    include: { messages: true, channel: true },
  });
  if (!thread || !message) {
    return {
      status: 404,
    };
  }

  const channel = await prisma.channels.findUnique({
    where: { id: message.channelId },
  });

  if (!channel) {
    return { status: 404 };
  }

  if (
    channel.accountId !== communityId ||
    thread.channel.accountId !== communityId
  ) {
    return { status: 404 };
  }

  if (!message.threadId) {
    return { status: 404 };
  }

  if (!permissions.user) {
    return { status: 404 };
  }

  const owner = permissions.user.id === message.usersId;

  if (permissions.manage || owner) {
    const previous = await prisma.threads.findFirst({
      where: { id: message.threadId },
      include: { messages: true },
    });

    if (!previous || previous.messages.length > 1) {
      await prisma.messages.update({
        where: { id: message.id },
        data: {
          threadId: thread.id,
        },
      });
    } else {
      await prisma.$transaction([
        prisma.messages.update({
          where: { id: message.id },
          data: {
            threadId: thread.id,
          },
        }),
        prisma.threads.delete({
          where: { id: previous.id },
        }),
      ]);
    }

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

  if (request.method === 'POST') {
    const { messageId, threadId, communityId } = request.body;
    const permissions = await Permissions.get({
      request,
      response,
      params: { communityId },
    });
    const { status, data } = await create({
      messageId,
      threadId,
      communityId,
      permissions,
    });
    return response.status(status).json(data || {});
  }
  return response.status(405).json({});
}
