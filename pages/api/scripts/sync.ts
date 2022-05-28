import { NextApiRequest, NextApiResponse } from 'next/types';
import { slackSync } from '../../../services/slack';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(new Date());
  const accountId = req.query.account_id as string;
  const channelId = req.query.channel_id as string;
  const domain = req.query.domain as string;

  try {
    const response = await slackSync({ accountId, channelId, domain });
    res.status(response.status).json(response.body);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
