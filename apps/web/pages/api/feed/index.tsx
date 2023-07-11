import { NextApiRequest, NextApiResponse } from 'next/types';
import FeedService from 'services/feed';
import { cors, preflight } from 'utilities/cors';

export async function index({ skip, take }: { skip: number; take: number }) {
  const { threads, settings, communities } = await FeedService.get({
    skip,
    take,
  });

  return {
    status: 200,
    data: {
      threads,
      settings,
      communities,
    },
  };
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'OPTIONS') {
    return preflight(request, response, ['GET']);
  }
  cors(request, response);
  const skip = Number(request.query.skip);
  const take = Number(request.query.take);
  const { status, data } = await index({ skip, take });

  response.setHeader(
    'Cache-Control',
    'max-age=60, stale-while-revalidate=86400'
  );
  return response.status(status).json(data);
}
