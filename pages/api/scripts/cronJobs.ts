import { NextApiRequest, NextApiResponse } from 'next';
import request from 'superagent';

async function callInternalJob(path: string) {
  request
    .get(process.env.SYNC_URL + path)
    .then(() => {
      console.log('Job done!', path);
    })
    .catch((err) => {
      console.error('Job error: ', err, path);
    });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  callInternalJob('/api/scripts/discordSyncJob');
  return res.status(200).json({});
}
