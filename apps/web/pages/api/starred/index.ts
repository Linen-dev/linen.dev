import { NextApiRequest, NextApiResponse } from 'next/types';
import PermissionsService from 'services/permissions';
import CommunityService from 'services/community';
import { prisma } from '@linen/database';
import { serializeThread } from '@linen/serializers/thread';
import ChannelsService from 'services/channels';
import { anonymizeMessages } from 'utilities/anonymizeMessages';
import { cors, preflight } from 'utilities/cors';
import { AnonymizeType } from '@linen/types';

function getPage(page?: number) {
  if (!page || page < 1) {
    return 1;
  }
  return page;
}

export async function index({
  params,
  currentUserId,
}: {
  params: {
    communityName?: string;
    page?: number;
    limit?: number;
    channelIds?: string[];
  };
  currentUserId: string;
}) {
  const community = await CommunityService.find(params);
  if (!community) {
    return { status: 404 };
  }

  const page = getPage(params.page);
  const channels = await ChannelsService.findPublic(community.id);

  if (!params.limit) {
    return { status: 400 };
  }

  const limit = Number(params.limit);

  const userStarredThreads = await prisma.userStarredThread.findMany({
    where: {
      userId: currentUserId,
    },
  });

  const condition = {
    hidden: false,
    messages: {
      some: {},
    },
    id: { in: userStarredThreads.map(({ threadId }) => threadId) },
    channelId: { in: channels.map(({ id }) => id) },
  } as any;

  const threads = await prisma.threads.findMany({
    where: condition,
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
        orderBy: { sentAt: 'asc' },
      },
      channel: true,
    },
    orderBy: { lastReplyAt: 'desc' },
    take: limit,
    skip: (page - 1) * limit,
  });

  const total = await prisma.userStarredThread.count({
    where: { userId: currentUserId },
  });

  return {
    status: 200,
    data: {
      total,
      threads: threads
        .map((thread) => {
          if (community.anonymizeUsers) {
            return anonymizeMessages(
              thread,
              community.anonymize as AnonymizeType
            );
          }
          return thread;
        })
        .map(serializeThread),
    },
  };
}

export async function create({
  params,
  currentUserId,
}: {
  params: {
    threadId?: string;
  };
  currentUserId: string;
}) {
  if (!params.threadId) {
    return { status: 400 };
  }
  const data = {
    userId: currentUserId,
    threadId: params.threadId,
  };
  const starred = await prisma.userStarredThread.findUnique({
    where: {
      userId_threadId: data,
    },
  });
  if (starred) {
    return { status: 409 };
  }
  await prisma.userStarredThread.create({
    data,
  });

  return { status: 200 };
}

export async function destroy({
  params,
  currentUserId,
}: {
  params: {
    threadId?: string;
  };
  currentUserId: string;
}) {
  if (!params.threadId) {
    return { status: 400 };
  }
  await prisma.userStarredThread.delete({
    where: {
      userId_threadId: { userId: currentUserId, threadId: params.threadId },
    },
  });

  return { status: 200 };
}

const handlers = {
  async index(request: NextApiRequest, response: NextApiResponse) {
    try {
      const permissions = await PermissionsService.get({
        request,
        response,
        params: {
          communityName: request.query.communityName as string,
        },
      });
      if (!permissions.starred) {
        return response.status(401).json({});
      }
      const { status, data } = await index({
        params: request.query,
        currentUserId: permissions.user.id,
      });
      response.status(status).json(data);
    } catch (exception) {
      if (process.env.NODE_ENV === 'development') {
        console.log(exception);
      }
      response.status(500).json({});
    }
  },
  async create(request: NextApiRequest, response: NextApiResponse) {
    try {
      const permissions = await PermissionsService.get({
        request,
        response,
        params: {
          communityId: request.body.communityId as string,
        },
      });
      if (!permissions.starred) {
        return response.status(401).json({});
      }
      const { status } = await create({
        params: request.body,
        currentUserId: permissions.user.id,
      });
      response.status(status).json({});
    } catch (exception) {
      if (process.env.NODE_ENV === 'development') {
        console.log(exception);
      }
      response.status(500).json({});
    }
  },
  async destroy(request: NextApiRequest, response: NextApiResponse) {
    try {
      const permissions = await PermissionsService.get({
        request,
        response,
        params: {
          communityId: request.body.communityId as string,
        },
      });
      if (!permissions.starred) {
        return response.status(401).json({});
      }
      const { status } = await destroy({
        params: request.body,
        currentUserId: permissions.user.id,
      });
      response.status(status).json({});
    } catch (exception) {
      if (process.env.NODE_ENV === 'development') {
        console.log(exception);
      }
      response.status(500).json({});
    }
  },
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'OPTIONS') {
    return preflight(request, response, ['POST', 'GET', 'DELETE']);
  }
  cors(request, response);

  if (request.method === 'GET') {
    return handlers.index(request, response);
  }
  if (request.method === 'POST') {
    return handlers.create(request, response);
  }
  if (request.method === 'DELETE') {
    return handlers.destroy(request, response);
  }
  return response.status(405).json({});
}
