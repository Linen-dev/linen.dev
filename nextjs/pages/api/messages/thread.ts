import { findMessagesFromChannel } from 'lib/models';
import Session from 'services/session';
import { NextApiRequest, NextApiResponse } from 'next/types';
import { withSentry } from '@sentry/nextjs';
import { prisma } from 'client';
import serializeMessage from 'serializers/message';
import parse from 'utilities/message/parsers/linen';
import { findUserIds } from 'utilities/message/find';
import { eventNewMessage } from 'services/events';
import { MessageFormat, Prisma } from '@prisma/client';
import PermissionsService from 'services/permissions';

async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'POST') {
    return create(request, response);
  }
  return response.status(404).json({});
}

export async function create(
  request: NextApiRequest,
  response: NextApiResponse<any>
) {
  const { body, communityId, channelId, threadId, imitationId } = JSON.parse(
    request.body
  );

  if (!threadId) {
    return response.status(400).json({ error: 'thread id is required' });
  }

  if (!channelId) {
    return response.status(400).json({ error: 'channel id is required' });
  }

  if (!imitationId) {
    return response.status(400).json({ error: 'imitation id is required' });
  }

  const session = await Session.find(request, response);
  if (!session?.user?.email) {
    return response.status(401).end();
  }

  const permissions = await PermissionsService.get({
    request,
    response,
    params: { communityId },
  });

  if (!permissions.chat) {
    return response.status(401).end();
  }

  const channel = await prisma.channels.findUnique({
    where: { id: channelId },
  });

  if (!channel || !channel.accountId) {
    return response.status(400).json({ error: "can't find the channel" });
  }

  const auth = await prisma.auths.findUnique({
    where: {
      email: session.user.email,
    },
    include: {
      users: {
        where: {
          accountsId: channel.accountId,
        },
      },
    },
  });

  if (!auth || !auth.users || auth.users.length === 0) {
    return response.status(401).json({ error: 'invalid user' });
  }

  const user = auth.users[0];

  if (!body) {
    return response.status(400).json({ error: 'message is required' });
  }

  const sentAt = new Date();
  const userId = user.id;

  const tree = parse(body);
  const userIds = findUserIds(tree);
  const messages = {
    create: {
      body,
      channel: { connect: { id: channelId } },
      sentAt,
      author: { connect: { id: userId } },
      mentions: {
        create: userIds.map((id: string) => ({ usersId: id })),
      },
      messageFormat: MessageFormat.LINEN,
    } as Prisma.messagesCreateInput,
  };

  await prisma.threads.update({
    where: {
      id: threadId,
    },
    data: {
      messageCount: {
        increment: 1,
      },
      messages,
    },
  });

  // TODO we could try to optimize this by combining this and previous query
  const message = await prisma.messages.findFirst({
    where: {
      body,
      channelId,
      sentAt,
      usersId: userId,
    },
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
  });

  if (!message) {
    return response.status(400).json({ error: 'failed to create message' });
  }

  await eventNewMessage({
    communityId,
    channelId,
    messageId: message.id,
    threadId,
    imitationId,
    mentions: message.mentions,
  });

  return response.status(200).json({
    message: serializeMessage(message),
    imitationId,
  });
}

export default withSentry(handler);
