import { NextApiRequest, NextApiResponse } from 'next/types';
import { channelNextPage } from '../../services/communities';
import prisma from '../../client';
import { decodeCursor } from '@/utilities/cursor';

async function update(request: NextApiRequest, response: NextApiResponse) {
  const incrementId = request.query.incrementId as string;
  await prisma.threads.update({
    where: { incrementId: parseInt(incrementId) },
    data: { viewCount: { increment: 1 } },
  });
  return response.status(200).json({});
}

async function post(request: NextApiRequest, response: NextApiResponse) {
  const channelId = request.body?.channelId as string;
  if (!channelId) return response.status(404).json({});

  const cursor = request.body?.cursor as string;
  if (!cursor) return response.status(404).json({});

  const result = await channelNextPage(channelId, decodeCursor(cursor));
  return response.status(200).json(result);
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'PUT') {
    return update(request, response);
  }
  if (request.method === 'POST') {
    return post(request, response);
  }
  return response.status(404);
}
