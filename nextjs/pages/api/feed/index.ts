import { NextApiRequest, NextApiResponse } from 'next/types';
import PermissionsService from 'services/permissions';
import CommunityService from 'services/community';
import prisma from 'client';
import { Prisma, ThreadState } from '@prisma/client';
import serializeThread from 'serializers/thread';
import { Scope } from 'types/shared';

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
    state?: ThreadState;
    scope?: Scope;
    page?: number;
  };
  currentUserId?: string;
}) {
  const community = await CommunityService.find(params);
  if (!community) {
    return { status: 404, data: 'NotFound' };
  }
  const page = getPage(params.page);
  const scope = params.scope || Scope.All;
  const limit = 10;
  const condition = {
    threads: {
      hidden: false,
      channel: { account: { id: community.id } },
      state: params.state || ThreadState.OPEN,
    },
    ...(!!currentUserId &&
      scope === Scope.Participant && {
        OR: [
          { usersId: currentUserId },
          { mentions: { some: { usersId: currentUserId } } },
        ],
      }),
  } as Prisma.messagesWhereInput;

  const total = await countThreads({
    state: params.state || ThreadState.OPEN,
    communityId: community.id,
    currentUserId:
      !!currentUserId && scope === Scope.Participant
        ? currentUserId
        : undefined,
  });

  const messages = await prisma.messages.findMany({
    where: condition,
    orderBy: { sentAt: 'desc' },
    distinct: ['threadId'],
    take: limit,
    skip: (page - 1) * limit,
    select: {
      threads: {
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
      },
    },
  });
  const threads = messages.map(({ threads }) => threads!);
  return {
    status: 200,
    data: {
      threads: threads.map(serializeThread),
      total,
    },
  };
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
      if (!permissions.feed) {
        return response.status(401).json({});
      }
      const { status, data } = await index({
        params: request.query,
        currentUserId: permissions.user?.id || undefined,
      });
      response.status(status).json(data);
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
  if (request.method === 'GET') {
    return handlers.index(request, response);
  }
  return response.status(404).json({});
}

async function countThreads({
  state,
  communityId,
  currentUserId,
}: {
  state: ThreadState;
  communityId: string;
  currentUserId?: string;
}) {
  return await prisma.threads.count({
    where: {
      hidden: false,
      state: state || ThreadState.OPEN,
      channel: { account: { id: communityId } },
      messageCount: { gte: 1 },
      messages: {
        some: {
          ...(!!currentUserId && {
            OR: [
              { usersId: currentUserId },
              { mentions: { some: { usersId: currentUserId } } },
            ],
          }),
        },
      },
    },
  });
}
