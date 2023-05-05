import { NextApiRequest, NextApiResponse } from 'next/types';
import { prisma } from '@linen/database';
import Permissions from 'services/permissions';
import CommunityService from 'services/community';
import { Permissions as PermissionsType } from '@linen/types';
import { cors, preflight } from 'utilities/cors';

export async function create({
  threadId,
  channelId,
  communityId,
  permissions,
}: {
  threadId: string;
  channelId: string;
  communityId: string;
  permissions: PermissionsType;
}) {
  if (!channelId || !threadId) {
    return { status: 400 };
  }

  const community = await CommunityService.find({ communityId });

  if (!community) {
    return { status: 404 };
  }

  const channel = await prisma.channels.findUnique({
    where: { id: channelId },
  });

  const thread = await prisma.threads.findUnique({
    where: { id: threadId },
    include: { messages: { orderBy: { sentAt: 'asc' } }, channel: true },
  });

  if (!channel || !thread) {
    return {
      status: 403,
    };
  }

  if (
    channel.accountId !== communityId ||
    thread.channel.accountId !== communityId
  ) {
    return { status: 403 };
  }

  if (!permissions.user) {
    return { status: 403 };
  }

  const message = thread.messages[0];

  if (!message) {
    return { status: 404 };
  }

  const owner = message.usersId === permissions.user.id;

  if (permissions.manage || owner) {
    await prisma.threads.update({
      where: { id: thread.id },
      data: {
        channelId: channel.id,
      },
    });

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
    const { communityId } = request.body;
    const permissions = await Permissions.get({
      request,
      response,
      params: { communityId },
    });
    const { threadId, channelId } = request.body;
    const { status, data } = await create({
      threadId,
      channelId,
      communityId,
      permissions,
    });
    return response.status(status).json(data || {});
  }
  return response.status(405).json({});
}
