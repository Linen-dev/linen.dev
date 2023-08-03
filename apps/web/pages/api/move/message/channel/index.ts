import { NextApiRequest, NextApiResponse } from 'next/types';
import { prisma } from '@linen/database';
import Permissions from 'services/permissions';
import CommunityService from 'services/community';
import { serializeThread } from '@linen/serializers/thread';
import { anonymizeMessages } from 'utilities/anonymizeMessages';
import { Permissions as PermissionsType } from '@linen/types';
import { cors, preflight } from 'utilities/cors';
import { AnonymizeType } from '@linen/types';

export async function create({
  messageId,
  channelId,
  communityId,
  permissions,
}: {
  messageId: string;
  channelId: string;
  communityId: string;
  permissions: PermissionsType;
}) {
  if (!messageId || !channelId) {
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
  const channel = await prisma.channels.findUnique({
    where: { id: channelId },
  });
  if (!channel || !message) {
    return {
      status: 404,
    };
  }

  if (!permissions.user) {
    return { status: 403 };
  }

  const owner = permissions.user.id === message.usersId;

  if (permissions.manage || owner) {
    const { id: threadId } = await prisma.threads.create({
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
        threadId: threadId,
        channelId: channel.id,
      },
    });

    const thread = await prisma.threads.findUnique({
      where: { id: threadId },
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
    });

    if (!thread) {
      return { status: 404 };
    }

    return {
      status: 200,
      data: serializeThread(
        community.anonymizeUsers
          ? anonymizeMessages(thread, community.anonymize as AnonymizeType)
          : thread
      ),
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
    const { messageId, channelId, communityId } = request.body;
    const permissions = await Permissions.get({
      request,
      response,
      params: { communityId },
    });
    const { status, data } = await create({
      messageId,
      channelId,
      communityId,
      permissions,
    });
    return response.status(status).json(data || {});
  }
  return response.status(405).json({});
}
