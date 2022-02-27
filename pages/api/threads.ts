import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../client';

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
  if (request.method === 'PUT') {
    return update(request, response);
  }
  return response.status(404);
}
