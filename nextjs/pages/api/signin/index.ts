import { NextApiRequest, NextApiResponse } from 'next/types';

export async function create() {
  return { status: 200, data: {} };
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'POST') {
    const { status, data } = await create();
    return response.status(status).json(data || {});
  }
  return response.status(200).json({});
}
