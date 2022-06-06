import { NextApiRequest, NextApiResponse } from 'next/types';
import { discordSync } from '../../../services/discord/sync';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const accountId = request.query.account_id as string;
  const fullSync = (request.query.full_sync as string) === 'true';
  const result = await discordSync({ accountId, fullSync });
  return response.status(result.status).json(result.body);
}
