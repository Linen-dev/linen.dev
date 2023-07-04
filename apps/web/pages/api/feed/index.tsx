import { NextApiRequest, NextApiResponse } from 'next/types';
import FeedService from 'services/feed';

export async function index({ skip, take }: { skip: number; take: number }) {
  const { threads, settings } = await FeedService.get({ skip, take });

  return {
    status: 200,
    data: {
      threads,
      settings,
    },
  };
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const skip = Number(request.query.skip);
  const take = Number(request.query.take);
  const { status, data } = await index({ skip, take });
  return response.status(status).json(data);
}
