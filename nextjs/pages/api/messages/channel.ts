import Session from 'services/session';
import { NextApiRequest, NextApiResponse } from 'next/types';
import { withSentry } from '@sentry/nextjs';
import { prisma } from 'client';
import serializeThread from 'serializers/thread';
import parse from 'utilities/message/parsers/linen';
import { findMentions } from 'utilities/message/find';
import { eventNewThread } from 'services/events';
import { MessageFormat, Prisma } from '@prisma/client';
import PermissionsService from 'services/permissions';
import unique from 'lodash.uniq';

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
  const { body, channelId, imitationId, communityId } = JSON.parse(
    request.body
  );
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
  const mentions = findMentions(tree);
  const userIds = unique(mentions.map(({ id }) => id));
  const messages = {
    create: {
      body,
      channel: { connect: { id: channelId } },
      sentAt,
      author: { connect: { id: userId } },
      mentions: {
        create: userIds,
      },
      messageFormat: MessageFormat.LINEN,
    } as Prisma.messagesCreateInput,
  };

  const thread = await prisma.threads.create({
    data: {
      channel: { connect: { id: channelId } },
      sentAt: sentAt.getTime(),
      messageCount: 1,
      messages,
    } as Prisma.threadsCreateInput,
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
        take: 1,
      },
      channel: true,
    },
  });

  await eventNewThread({
    communityId,
    channelId,
    messageId: thread.messages[0].id,
    threadId: thread.id,
    imitationId,
    mentions: thread.messages[0].mentions,
  });

  return response.status(200).json({
    thread: serializeThread(thread),
    imitationId,
  });
}

export default withSentry(handler);
