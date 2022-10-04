import { NextApiRequest, NextApiResponse } from 'next/types';
import PermissionsService from 'services/permissions';
import CommunityService from 'services/community';
import ChannelsService from 'services/channels';
import Session from 'services/session';
import prisma from 'client';
import { ThreadState } from '@prisma/client';
import serializeThread from 'serializers/thread';
import { Scope } from 'types/shared';
import { users } from '@prisma/client';

function getPage(page?: number) {
  if (!page || page < 1) {
    return 1;
  }
  return page;
}

export async function index({
  params,
  currentUser,
}: {
  params: {
    communityName?: string;
    state?: ThreadState;
    scope?: Scope;
    page?: number;
  };
  currentUser: users;
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
  } as any;

  if (scope === Scope.Participant) {
    condition.messages.some.OR = [
      { usersId: currentUser.id },
      { mentions: { some: { usersId: currentUser.id } } },
    ];
  }

  const total = await prisma.threads.count({
    where: condition,
  });

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
    orderBy: { sentAt: 'desc' },
    take: limit,
    skip: (page - 1) * limit,
  });
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
      const currentUser = await Session.user(request, response);
      if (!currentUser) {
        return response.status(401).json({});
      }
      const permissions = await PermissionsService.get({
        request,
        response,
        params: request.query,
      });
      if (!permissions.feed) {
        return response.status(401).json({});
      }
      const { status, data } = await index({
        params: request.query,
        currentUser,
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
