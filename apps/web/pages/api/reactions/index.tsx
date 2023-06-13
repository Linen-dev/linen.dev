import { NextApiRequest, NextApiResponse } from 'next/types';
import { Prisma, prisma } from '@linen/database';
import PermissionsService from 'services/permissions';
import { cors, preflight } from 'utilities/cors';

async function create(request: NextApiRequest, response: NextApiResponse) {
  const {
    communityId,
    messageId,
    type,
    action,
  }: {
    communityId?: string;
    messageId?: string;
    type?: string;
    action?: string;
  } = request.body;
  if (!communityId || !messageId || !type || !action) {
    return response.status(400).end();
  }
  const permissions = await PermissionsService.get({
    request,
    response,
    params: { communityId },
  });
  if (!permissions.is_member) {
    return response.status(401).end();
  }
  const message = await prisma.messages.findUnique({
    where: { id: messageId },
    include: {
      channel: true,
    },
  });

  if (!message) {
    return response.status(404).json({});
  }

  if (message.channel.accountId !== communityId) {
    return response.status(401).json({});
  }

  const reaction = await prisma.messageReactions.findFirst({
    where: {
      messagesId: messageId,
      name: type,
    },
  });

  const userId = permissions.user.id;

  if (!reaction) {
    await prisma.messageReactions.create({
      data: {
        messagesId: messageId,
        name: type,
        count: 1,
        users: [userId as Prisma.JsonValue] as Prisma.JsonArray,
      },
    });
  } else {
    let { users } = reaction;
    if (users && Array.isArray(users)) {
      if (action === 'increment' && !users.includes(userId)) {
        users = [...users, userId];
      } else if (users.includes(userId)) {
        users = users.filter((id) => id !== userId);
      }
    }

    await prisma.messageReactions.updateMany({
      where: {
        messagesId: messageId,
        name: type,
      },
      data: {
        count: action === 'increment' ? { increment: 1 } : { decrement: 1 },
        users: users as Prisma.JsonArray,
      },
    });
  }

  return response.status(200).json({});
}

async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'OPTIONS') {
    return preflight(request, response, ['POST']);
  }
  cors(request, response);

  if (request.method === 'POST') {
    return create(request, response);
  }
  return response.status(405).json({});
}

export default handler;
