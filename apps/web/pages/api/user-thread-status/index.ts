import { NextApiRequest, NextApiResponse } from 'next/types';
import PermissionsService from 'services/permissions';
import prisma from 'client';
import { z } from 'zod';

const createSchema = z.object({
  threadId: z.string(),
  muted: z.boolean(),
  read: z.boolean(),
});

export async function create(params: {
  threadId: string;
  communityId: string;
  userId: string;
  muted: boolean;
  read: boolean;
}) {
  const body = createSchema.safeParse(params);
  if (!body.success) {
    return { status: 400, data: { error: body.error } };
  }

  const { threadId, communityId, userId, muted, read } = params;

  const thread = await prisma.threads.findFirst({
    where: {
      id: threadId,
    },
    include: {
      channel: {
        select: {
          accountId: true,
        },
      },
    },
  });

  if (!thread) {
    return { status: 404 };
  }

  if (thread.channel.accountId !== communityId) {
    return { status: 403 };
  }

  const status = await prisma.userThreadStatus.upsert({
    where: {
      userId_threadId: { userId, threadId },
    },
    update: {
      muted,
      read,
    },
    create: {
      userId,
      threadId,
      muted,
      read,
    },
  });

  return { status: 200, data: status };
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'POST') {
    const permissions = await PermissionsService.get({
      request,
      response,
      params: {
        communityId: request.body.communityId,
      },
    });
    if (!permissions.access) {
      return response.status(401).json({});
    }
    const { status, data } = await create({
      ...request.body,
      userId: permissions.user.id,
    });
    return response.status(status).json(data || {});
  }
  return response.status(405).json({});
}
