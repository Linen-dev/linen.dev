import { NextApiRequest, NextApiResponse } from 'next/types';
import { findMessageById } from 'lib/messages';
import serializeMessage from 'serializers/message';
import PermissionsService from 'services/permissions';
import prisma from 'client';

async function index(request: NextApiRequest, response: NextApiResponse) {
  const id = request.query.id as string;

  const message = await findMessageById({ id });
  if (!message) {
    return response.status(404).json({});
  }
  if (!message.channel.accountId) {
    return response.status(401).json({});
  }

  const permissions = await PermissionsService.get({
    request,
    response,
    params: {
      communityId: message.channel.accountId,
    },
  });
  if (!permissions.access) {
    return response.status(401).json({});
  }

  return response.status(200).json(serializeMessage(message));
}

async function destroy(request: NextApiRequest, response: NextApiResponse) {
  const id = request.query.id as string;

  const message = await findMessageById({ id });
  if (!message) {
    return response.status(404).json({});
  }
  if (!message.channel.accountId) {
    return response.status(401).json({
      error: 'Message does not have a related channel',
    });
  }

  if (!message.usersId) {
    return response.status(401).json({
      error: 'Message does not have an author',
    });
  }

  const permissions = await PermissionsService.get({
    request,
    response,
    params: {
      communityId: message.channel.accountId,
    },
  });
  if (!permissions.access) {
    return response.status(401).json({
      error: 'No access permissions',
    });
  }

  const canDelete =
    permissions.user.id === message.usersId || permissions.manage;

  if (!canDelete) {
    return response.status(401).json({
      error: 'No manage permissions',
    });
  }

  await prisma.messages.delete({
    where: {
      id: message.id,
    },
  });

  if (message.threadId) {
    const thread = await prisma.threads.findFirst({
      where: {
        id: message.threadId,
      },
      include: {
        messages: true,
      },
    });

    if (thread && thread.messages.length === 0) {
      await prisma.threads.delete({
        where: {
          id: thread.id,
        },
      });
    }
  }

  return response.status(200).json({});
}

async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'GET') {
    return index(request, response);
  } else if (request.method === 'DELETE') {
    return destroy(request, response);
  }
  return response.status(405).json({});
}

export default handler;
