import { internalCreateXMLSitemapForFreeCommunity } from '@/utilities/sitemap';
import { NextApiRequest, NextApiResponse } from 'next/types';
import { cacheSeconds } from '../_settings';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const host = req.query?.host as string;
  const community = req.query?.community as string;
  const result = await internalCreateXMLSitemapForFreeCommunity(
    host,
    community
  );
  res.setHeader('Cache-Control', 'max-age=' + cacheSeconds);
  res.status(200).json(result);
}
