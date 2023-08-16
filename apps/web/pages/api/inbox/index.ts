import { NextApiRequest, NextApiResponse } from 'next/types';
import PermissionsService from 'services/permissions';
import CommunityService from 'services/community';
import { prisma } from '@linen/database';
import { serializeThread } from '@linen/serializers/thread';
import ChannelsService, { getDMs } from 'services/channels';
import { anonymizeMessages } from 'utilities/anonymizeMessages';
import { AnonymizeType, SerializedChannel } from '@linen/types';
import { cors, preflight } from 'utilities/cors';
import { daysAgo } from '@linen/utilities/date';

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
  const dms = !!currentUserId
    ? await getDMs({
        accountId: community.id,
        userId: currentUserId,
      })
    : [];
  const privateChannels = !!currentUserId
    ? await ChannelsService.findPrivates({
        accountId: community.id,
        userId: currentUserId,
      })
    : [];

  const channelsMap = [...channels, ...dms, ...privateChannels].reduce(
    (prev: any, curr: any) => {
      return {
        ...prev,
        [curr.id]: curr,
      };
    },
    {} as Record<string, SerializedChannel>
  );

  const condition = {
    hidden: false,
    channelId: {
      in: [...channels, ...dms, ...privateChannels]
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
    lastReplyAt: { lt: new Date().getTime(), gt: daysAgo(60).getTime() },
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
            return anonymizeMessages(
              thread,
              community.anonymize as AnonymizeType
            );
          }
          return { ...thread, channel: channelsMap[thread.channelId] };
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
  if (request.method === 'OPTIONS') {
    return preflight(request, response, ['POST']);
  }
  cors(request, response);
  // using POST to prevent url length limit
  if (request.method === 'POST') {
    return handlers.index(request, response);
  }
  return response.status(405).json({});
}
