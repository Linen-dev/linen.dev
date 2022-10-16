import { NextApiRequest, NextApiResponse } from 'next/types';
import PermissionsService from 'services/permissions';
import CommunityService from 'services/community';
import prisma from 'client';
import { ThreadState } from '@prisma/client';
import serializeThread from 'serializers/thread';
import { Scope } from 'types/shared';
import ChannelsService from 'services/channels';

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
    total?: boolean;
  };
  currentUserId?: string;
}) {
  const community = await CommunityService.find(params);
  if (!community) {
    return { status: 404 };
  }
  const page = getPage(params.page);
  const scope = params.scope || Scope.All;
  const limit = 10;
  const channels = await ChannelsService.find(community.id);
  const condition = {
    hidden: false,
    state: params.state || ThreadState.OPEN,
    channelId: { in: channels.map((channel) => channel.id) },
    messageCount: { gte: 1 },
    messages: {
      some: {},
    },
    lastReplyAt: { lt: new Date().getTime() },
  } as any;

  if (!!currentUserId && scope === Scope.Participant) {
    condition.messages.some.OR = [
      { usersId: currentUserId },
      { mentions: { some: { usersId: currentUserId } } },
    ];
  }

  if (!!params.total) {
    const total = await prisma.threads.count({
      where: condition,
    });
    return {
      status: 200,
      data: {
        total,
      },
    };
  }

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
  return {
    status: 200,
    data: {
      threads: threads.map(serializeThread),
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
