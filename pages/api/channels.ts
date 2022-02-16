import { NextApiRequest, NextApiResponse } from 'next/types';
import { channelIndex, findOrCreateChannel } from '../../lib/slack';

//example post body:
// {
//     "slack_channel_id": "C030HFK836C",
//     "channel_name": "Papercups"
//     "account_id": "aecb2deb-75a5-402e-8d0e-2585b8756e96"
// }

// example get query: /api/channels?account_id="aecb2deb-75a5-402e-8d0e-2585b8756e96"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const slackChannelId = req.body.slack_channel_id;
    const channelName = req.body.channel_name;
    const accountId = req.body.account_id;

    const channel = await findOrCreateChannel({
      slackChannelId,
      channelName,
      accountId,
    });
    res.status(200).json(channel);
    return;
  } else {
    const accountId = req.query.account_id;
    const channels = await channelIndex(accountId as string);
    res.status(200).json(channels);
  }
}

const get = () => {};
