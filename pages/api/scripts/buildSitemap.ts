import { NextApiRequest, NextApiResponse } from 'next';
import { buildSiteMap } from '../../../services/sitemap';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await buildSiteMap();
    return res.status(200).json({});
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
}
