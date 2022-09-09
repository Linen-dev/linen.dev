import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../client';
import { withSentry } from 'utilities/sentry';
import { channelNextPage } from 'services/channel';

async function update(request: NextApiRequest, response: NextApiResponse) {
  const incrementId = request.query.incrementId as string;
  await prisma.threads.update({
    where: { incrementId: parseInt(incrementId) },
    data: { viewCount: { increment: 1 } },
  });
  return response.status(200).json({});
}

async function get(request: NextApiRequest, response: NextApiResponse) {
  const channelId = request.query?.channelId as string;
  if (!channelId) return response.status(404).json({});

  const cursor = request.query?.cursor as string;
  if (!cursor) return response.status(404).json({});

  const result = await channelNextPage(channelId, cursor);
  return response.status(200).json(result);
}

async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'PUT') {
    return update(request, response);
  }
  if (request.method === 'GET') {
    return get(request, response);
  }
  return response.status(404).json({});
}

export default withSentry(handler);
