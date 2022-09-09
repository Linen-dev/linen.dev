import { NextApiRequest, NextApiResponse } from 'next/types';
import PermissionsService from 'services/permissions';
import CommunityService from 'services/community';
import ChannelsService from 'services/channels';
import prisma from 'client';
import { ThreadState } from '@prisma/client';

export async function index({
  params,
}: {
  params: { communityName?: string; state?: ThreadState };
}) {
  const community = await CommunityService.find(params);
  if (!community) {
    return { status: 404 };
  }
  const channels = await ChannelsService.find(community.id);
  const threads = await prisma.threads.findMany({
    where: {
      hidden: false,
      state: params.state || ThreadState.OPEN,
      channelId: { in: channels.map((channel) => channel.id) },
    },
  });
  return {
    status: 200,
    data: {
      threads,
    },
  };
}

const handlers = {
  async index(request: NextApiRequest, response: NextApiResponse) {
    try {
      const permissions = await PermissionsService.get({
        request,
        response,
        params: request.query,
      });
      if (!permissions.inbox) {
        return response.status(401).json({});
      }
      const { status, data } = await index({ params: request.query });
      response.status(status).json(data);
    } catch (exception) {
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
