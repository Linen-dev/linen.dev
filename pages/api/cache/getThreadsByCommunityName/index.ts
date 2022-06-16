import { NextApiRequest, NextApiResponse } from 'next/types';
import { getThreadsByCommunityName } from 'services/communities';
import { cacheSeconds } from '../_settings';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const communityName = req.query?.communityName as string;
  const channelName = req.query?.channelName as string;
  const page = req.query?.page as string;

  const result = await getThreadsByCommunityName(
    communityName,
    Number(page) || 1,
    channelName
  );

  res.setHeader('Cache-Control', 'max-age=' + cacheSeconds);
  res.status(200).json(result);
}
