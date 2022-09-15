import { findMessagesFromChannel } from 'lib/models';
import { unstable_getServerSession } from 'next-auth';
import { NextApiRequest, NextApiResponse } from 'next/types';
import { authOptions } from '../auth/[...nextauth]';
import { withSentry } from 'utilities/sentry';
import { prisma } from 'client';
import serializeMessage from 'serializers/message';
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

  const { body, channelId, threadId } = JSON.parse(request.body);

  if (!threadId) {
    return response.status(400).json({ error: 'thread id is required' });
  }

  if (!channelId) {
    return response.status(400).json({ error: 'channel id is required' });
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

  await push({
    channelId,
    body: {
      message: serializeMessage(message),
      threadId: threadId,
    },
  });

  return response.status(200).json(serializeMessage(message));
}

export default withSentry(handler);
