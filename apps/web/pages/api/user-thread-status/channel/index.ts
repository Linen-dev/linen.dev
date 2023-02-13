import { NextApiRequest, NextApiResponse } from 'next/types';
import PermissionsService from 'services/permissions';
import { z } from 'zod';
import UserThreadStatusService from 'services/user-thread-status';

const createSchema = z.object({
  channelId: z.string(),
});

export async function create(params: { channelId: string; userId: string }) {
  const body = createSchema.safeParse(params);
  if (!body.success) {
    return { status: 400, data: { error: body.error } };
  }

  const { channelId, userId } = params;

  try {
    await UserThreadStatusService.markAllAsRead({ channelId, userId });
  } catch (exception) {
    console.log(exception);
    return { status: 500 };
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
