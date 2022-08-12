import { NextApiRequest, NextApiResponse } from 'next/types';
import { discordSync } from '../../../services/discord/sync';
import { withSentry } from 'utilities/sentry';

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const accountId = request.query.account_id as string;
  const fullSync = (request.query.full_sync as string) === 'true';
  response.setHeader('Cache-Control', 'max-age=60');
  discordSync({ accountId, fullSync });
  return response.status(200).json({});
}

export default withSentry(handler);
