import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../client';
import { threadIndex } from '../../lib/slack';
import serializeThread from '../../serializers/thread';

async function index(request: NextApiRequest, response: NextApiResponse) {
  const channelId = request.query.channelId as string;
  const take = request.query.take as string;
  const skip = request.query.skip as string;
  const threads = await threadIndex(
    channelId,
    Number(take) || 50,
    Number(skip) || 0
  );

  return response.status(200).json({
    threads: threads.map(serializeThread),
  });
}

async function update(request: NextApiRequest, response: NextApiResponse) {
  const id = request.query.id as string;
  await prisma.slackThreads.update({
    where: { id },
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
