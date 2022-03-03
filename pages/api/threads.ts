import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../client';
import { findChannel, listUsers, threadIndex } from '../../lib/slack';

async function index(request: NextApiRequest, response: NextApiResponse) {
  const channelId = request.query.channelId as string;
  const skip = request.query.skip as string;
  const threads = await threadIndex(channelId, 5, Number(skip) || 0);

  return response.status(200).json({
    threads: threads.map((t) => ({
      ...t,
      messages: t.messages.map((m) => {
        return {
          body: m.body,
          // Have to convert to string b/c Nextjs doesn't support date hydration -
          // see: https://github.com/vercel/next.js/discussions/11498
          sentAt: m.sentAt.toString(),
          author: m.author,
        };
      }),
    })),
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
