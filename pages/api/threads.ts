import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../client';
import { index as fetchThreads } from '../../services/threads';

async function index(request: NextApiRequest, response: NextApiResponse) {
  type PermittedParams = { channelId?: string; page?: string };
  const query = request.query as PermittedParams;
  const channelId = query.channelId;
  const page = query.page ? parseInt(query.page, 10) : 1;
  const { data, pagination } = await fetchThreads({ channelId, page });

  return response.status(200).json({
    data,
    pagination,
  });
}

async function update(request: NextApiRequest, response: NextApiResponse) {
  const incrementId = request.query.incrementId as string;
  await prisma.slackThreads.update({
    where: { incrementId: parseInt(incrementId) },
    data: { viewCount: { increment: 1 } },
  });
  return response.status(200).json({});
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'GET') {
    return index(request, response);
  }
  if (request.method === 'PUT') {
    return update(request, response);
  }
  return response.status(404);
}
