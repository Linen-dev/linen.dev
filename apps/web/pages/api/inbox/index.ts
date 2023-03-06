import { NextApiRequest, NextApiResponse } from 'next/types';
import PermissionsService from 'services/permissions';
import CommunityService from 'services/community';
import { prisma } from '@linen/database';
import serializeThread from 'serializers/thread';
import ChannelsService from 'services/channels';
import { anonymizeMessages } from 'utilities/anonymizeMessages';

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
  const channels = await ChannelsService.find(community.id);
  const condition = {
    hidden: false,
    channelId: {
      in: channels
        .map((channel) => channel.id)
        .filter((channelId) => {
          if (!params.channelIds || params.channelIds.length === 0) {
            return true;
          }
          return params.channelIds.includes(channelId);
        }),
    },
    messages: {
      some: {},
    },
    lastReplyAt: { lt: new Date().getTime() },
    userThreadStatus: {
      none: {
        userId: currentUserId,
        OR: [{ read: true }, { muted: true }, { reminder: true }],
      },
    },
  } as any;

  if (!params.limit) {
    return { status: 400 };
  }

  const limit = Number(params.limit);

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

  const total = await prisma.threads.count({
    where: condition,
  });

  return {
    status: 200,
    data: {
      total,
      threads: threads
        .map((thread) => {
          if (community.anonymizeUsers) {
            return anonymizeMessages(thread);
          }
          return thread;
        })
        .map(serializeThread),
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
          communityName: request.body.communityName as string,
        },
      });
      if (!permissions.inbox) {
        return response.status(401).json({});
      }
      const { status, data } = await index({
        params: request.body,
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
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  // using POST to prevent url length limit
  if (request.method === 'POST') {
    return handlers.index(request, response);
  }
  return response.status(404).json({});
}
