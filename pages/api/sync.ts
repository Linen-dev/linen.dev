import type { NextApiRequest, NextApiResponse } from 'next';
import request from 'superagent';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const accountId = req.query.account_id as string;
  // Initialize syncing asynchronously
  console.log('Start syncing account: ', accountId);
  request
    .get(
      process.env.SYNC_URL + '/api/scripts/syncHistoric?account_id=' + accountId
    )
    .then(() => {
      console.log('Syncing done!');
    })
    .catch((err) => {
      console.error('Syncing error: ', err.status, err.message);
    });

  return res.status(200).json({});
}
