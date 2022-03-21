import { NextApiRequest, NextApiResponse } from 'next/types';

async function create(request: NextApiRequest, response: NextApiResponse) {
  return response.status(200).json({});
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
