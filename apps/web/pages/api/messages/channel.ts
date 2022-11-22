import Session from 'services/session';
import { NextApiRequest, NextApiResponse } from 'next/types';
import { prisma } from 'client';
import serializeThread from 'serializers/thread';
import { parse, find } from '@linen/ast';
import { eventNewThread } from 'services/events';
import { Prisma } from '@prisma/client';
import { MessageFormat } from '@linen/types';
import PermissionsService from 'services/permissions';
import unique from 'lodash.uniq';
import { UploadedFile } from '@linen/types';
import { v4 as uuid } from 'uuid';

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
  const { body, files, channelId, imitationId, communityId } = JSON.parse(
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

  const tree = parse.linen(body);
  const mentionNodes = find.mentions(tree);
  const userIds = unique(mentionNodes.map(({ id }: { id: string }) => id));
  const messages = {
    create: {
      body,
      channel: { connect: { id: channelId } },
      sentAt,
      author: { connect: { id: userId } },
      mentions: {
        create: userIds.map((id: string) => ({ usersId: id })),
      },
      attachments: {
        create: files.map((file: UploadedFile) => ({
          externalId: uuid(), // TODO should this be optional?
          name: file.id,
          sourceUrl: file.url, // TODO should this be optional?
          internalUrl: file.url,
        })),
      },
      messageFormat: MessageFormat.LINEN,
    } as Prisma.messagesCreateInput,
  };

  const thread = await prisma.threads.create({
    data: {
      channel: { connect: { id: channelId } },
      sentAt: sentAt.getTime(),
      lastReplyAt: sentAt.getTime(),
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

  const serializedThread = serializeThread(thread);
  await eventNewThread({
    communityId,
    channelId,
    messageId: thread.messages[0].id,
    threadId: thread.id,
    imitationId,
    mentions: thread.messages[0].mentions,
    mentionNodes,
    thread: JSON.stringify(serializedThread),
  });

  return response.status(200).json({
    thread: serializedThread,
    imitationId,
  });
}

export default handler;
