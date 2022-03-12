import { NextApiRequest, NextApiResponse } from 'next/types';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  return response.json({});
}
