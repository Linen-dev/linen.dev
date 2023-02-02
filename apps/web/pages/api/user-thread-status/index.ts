import { NextApiRequest, NextApiResponse } from 'next/types';
import PermissionsService from 'services/permissions';
import prisma from 'client';
import { z } from 'zod';

const createSchema = z.object({
  threadIds: z.array(z.string()),
  muted: z.boolean(),
  read: z.boolean(),
});

export async function create(params: {
  threadIds: string[];
  userId: string;
  muted: boolean;
  read: boolean;
}) {
  const body = createSchema.safeParse(params);
  if (!body.success) {
    return { status: 400, data: { error: body.error } };
  }

  const { threadIds, userId, muted, read } = params;

  const creation = muted || read;

  if (creation) {
    await prisma.$transaction([
      prisma.userThreadStatus.deleteMany({
        where: {
          userId,
          threadId: { in: threadIds },
        },
      }),
      prisma.userThreadStatus.createMany({
        data: threadIds.map((threadId) => {
          return {
            userId,
            threadId,
            muted,
            read,
          };
        }),
      }),
    ]);
  } else {
    await prisma.userThreadStatus.deleteMany({
      where: {
        userId,
        threadId: { in: threadIds },
      },
    });
  }

  return { status: 200 };
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

    if (!permissions.user) {
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
