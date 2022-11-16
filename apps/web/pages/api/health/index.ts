import { NextApiRequest, NextApiResponse } from 'next/types';

export async function index() {
  return { status: 200 };
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { status } = await index();
  return response.status(status).json({});
}
