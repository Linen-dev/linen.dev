import { NextApiRequest, NextApiResponse } from 'next';
import { processLinenSitemap } from '../../../services/sitemap';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  processLinenSitemap();
  return res.status(200).json({});
}
