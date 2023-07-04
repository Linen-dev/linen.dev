import { NextApiRequest, NextApiResponse } from 'next/types';
import FeedService from 'services/feed';

export async function index({ skip }: { skip: number }) {
  const { threads, settings } = await FeedService.get({ skip });

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
  const { status, data } = await index({ skip });
  return response.status(status).json(data);
}
