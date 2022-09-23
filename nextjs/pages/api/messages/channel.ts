import { findMessagesFromChannel } from 'lib/models';
import { unstable_getServerSession } from 'next-auth';
import { NextApiRequest, NextApiResponse } from 'next/types';
import { authOptions } from '../auth/[...nextauth]';
import { withSentry } from '@sentry/nextjs';
import { prisma } from 'client';
import serializeThread from 'serializers/thread';
import { push } from 'services/push';

async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'GET') {
    return getMessagesFromChannel(request, response);
  } else if (request.method === 'POST') {
    return create(request, response);
  }
  return response.status(404).json({});
}

async function getMessagesFromChannel(
  request: NextApiRequest,
  response: NextApiResponse<any>
) {
  const channelId = request.query.channelId as string;
  const page = request.query.page as string;

  const { messages } = await findMessagesFromChannel({
    channelId,
    page: Number(page),
  });

  return response.status(200).json(
    messages.map((message) => {
      return {
        ...message,
        createdAt: message?.createdAt?.toISOString(),
        sentAt: message?.sentAt?.toISOString(),
      };
    })
  );
}

//TODO: refactor to use permissions service
export async function create(
  request: NextApiRequest,
  response: NextApiResponse<any>
) {
  const session = await unstable_getServerSession(
    request,
    response,
    authOptions
  );
  if (!session?.user?.email) {
    throw 'missing session';
  }

  const { body, channelId, imitationId } = JSON.parse(request.body);
  if (!channelId) {
    return response.status(400).json({ error: 'channel id is required' });
  }

  if (!imitationId) {
    return response.status(400).json({ error: 'imitation id is required' });
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

  //TODO: check empty attachment
  if (!body) {
    return response.status(400).json({ error: 'message is required' });
  }

  const sentAt = new Date();
  const userId = user.id;

  const messages = {
    create: {
      body,
      channelId,
      sentAt,
      usersId: userId,
    },
  } as any;

  const thread = await prisma.threads.create({
    data: {
      channelId: channelId,
      sentAt: sentAt.getTime(),
      messageCount: 1,
      messages,
    } as any,
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

  await push({
    channelId: channel.id,
    body: {
      thread: serializeThread(thread),
      imitationId: imitationId,
    },
  });

  return response.status(200).json({
    thread: serializeThread(thread),
    imitationId,
  });
}

export default withSentry(handler);
