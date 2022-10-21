import { NextApiRequest, NextApiResponse } from 'next/types';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  return response.status(200).end();
}
