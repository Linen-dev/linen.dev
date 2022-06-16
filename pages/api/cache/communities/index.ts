import { accountsWithDomain } from '@/lib/models';
import { NextApiRequest, NextApiResponse } from 'next/types';
import { cacheSeconds } from '../_settings';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const accounts = await accountsWithDomain();
  response.setHeader('Cache-Control', 'max-age=' + cacheSeconds);
  return response.status(200).json(accounts);
}
