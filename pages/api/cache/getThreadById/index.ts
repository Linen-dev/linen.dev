import { NextApiRequest, NextApiResponse } from 'next/types';
import { internalGetThreadById } from 'services/threads';
import { cacheSeconds } from '../_settings';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const threadId = req.query?.threadId as string;
  const result = await internalGetThreadById(threadId);
  res.setHeader('Cache-Control', 'max-age=' + cacheSeconds);
  res.status(200).json(result);
}
