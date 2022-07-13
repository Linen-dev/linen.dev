import { NextApiRequest, NextApiResponse } from 'next/types';
import { slugify } from '../../../services/slugify';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const response = await slugify();
  return res.status(response.status).json(response.body);
}
