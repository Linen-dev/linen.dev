import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../../client';
import { withSentry } from 'utilities/sentry';
import { ThreadState } from '@prisma/client';

async function update(request: NextApiRequest, response: NextApiResponse) {
  const id = request.query.id as string;
  const state = request.query.state as ThreadState;
  await prisma.threads.update({
    where: { id },
    data: { state },
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
