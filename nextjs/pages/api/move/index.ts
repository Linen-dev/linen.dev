import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from 'client';
import Permissions from 'services/permissions';
import CommunityService from 'services/community';

export async function create({
  messageId,
  threadId,
  communityId,
}: {
  messageId: string;
  threadId: string;
  communityId: string;
}) {
  if (!messageId || !threadId) {
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
  const thread = await prisma.threads.findUnique({
    where: { id: threadId },
    include: { messages: true, channel: true },
  });
  if (!thread || !message) {
    return {
      status: 403,
    };
  }

  const channel = await prisma.channels.findUnique({
    where: { id: message.channelId },
  });

  if (!channel) {
    return { status: 403 };
  }

  if (
    channel.accountId !== communityId ||
    thread.channel.accountId !== communityId
  ) {
    return { status: 403 };
  }

  if (!message.threadId) {
    return { status: 403 };
  }

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
    const { messageId, threadId } = request.body;
    const { status, data } = await create({ messageId, threadId, communityId });
    return response.status(status).json(data || {});
  }
  return response.status(200).json({});
}
