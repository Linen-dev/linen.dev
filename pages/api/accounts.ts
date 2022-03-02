import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../client';

async function create(request: NextApiRequest, response: NextApiResponse) {
  const { homeUrl, docsUrl, redirectDomain, brandColor } = JSON.parse(
    request.body
  );
  const account = await prisma.accounts.create({
    data: { homeUrl, docsUrl, redirectDomain, brandColor },
  });
  return response.status(200).json(account);
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'POST') {
    return create(request, response);
  }
  return response.status(404);
}
