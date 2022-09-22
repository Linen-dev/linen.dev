import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../../client';
import { withSentry } from '@sentry/nextjs';

async function update(request: NextApiRequest, response: NextApiResponse) {
  const incrementId = request.query.incrementId as string;
  await prisma.threads.update({
    where: { incrementId: parseInt(incrementId) },
    data: { viewCount: { increment: 1 } },
  });
  return response.status(200).json({});
}

async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'PUT') {
    return update(request, response);
  }
  return response.status(404).json({});
}

export default withSentry(handler);
