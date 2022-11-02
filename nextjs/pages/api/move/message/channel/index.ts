import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from 'client';
import Permissions from 'services/permissions';
import CommunityService from 'services/community';

export async function create({
  messageId,
  channelId,
  communityId,
}: {
  messageId: string;
  channelId: string;
  communityId: string;
}) {
  if (!messageId || !channelId) {
    return { status: 400 };
  }

  const community = await CommunityService.find({ communityId });

  if (!community) {
    return { status: 403 };
  }

  const message = await prisma.messages.findUnique({
    where: { id: messageId },
    include: { channel: true, threads: true },
  });
  const channel = await prisma.channels.findUnique({
    where: { id: channelId },
  });
  if (!channel || !message) {
    return {
      status: 403,
    };
  }

  const thread = await prisma.threads.create({
    data: {
      channelId: channel.id,
      sentAt: new Date().getTime(),
      lastReplyAt: message.sentAt.getTime(),
      messageCount: 1,
    },
  });
  await prisma.messages.update({
    where: { id: message.id },
    data: {
      threadId: thread.id,
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
    const { messageId, channelId } = request.body;
    const { status, data } = await create({
      messageId,
      channelId,
      communityId,
    });
    return response.status(status).json(data || {});
  }
  return response.status(200).json({});
}
