import { NextApiRequest, NextApiResponse } from 'next/types';
import FeedService from 'services/feed';
import { cors, preflight } from 'utilities/cors';

export async function index({ lastReplyAt }: { lastReplyAt?: number }) {
  const { threads, settings, communities, cursor } = await FeedService.get({
    lastReplyAt,
  });

  return {
    status: 200,
    data: {
      threads,
      settings,
      communities,
      cursor,
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
  const lastReplyAt = !!request.query.cursor
    ? Number(request.query.cursor)
    : undefined;
  const { status, data } = await index({ lastReplyAt });

  if (process.env.NODE_ENV === 'production') {
    response.setHeader(
      'Cache-Control',
      'max-age=1, stale-while-revalidate=86400'
    );
  }
  return response.status(status).json(data);
}
