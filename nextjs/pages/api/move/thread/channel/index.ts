import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from 'client';
import Permissions from 'services/permissions';
import CommunityService from 'services/community';
import { Permissions as PermissionsType } from 'types/shared';

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
    include: { channel: true },
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

  if (!permissions.manage) {
    return response.status(401).json({});
  }

  if (request.method === 'POST') {
    const { threadId, channelId } = request.body;
    const { status, data } = await create({ threadId, channelId, communityId });
    return response.status(status).json(data || {});
  }
  return response.status(200).json({});
}
