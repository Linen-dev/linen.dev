import type { NextApiRequest, NextApiResponse } from 'next';
import { newDiscordIntegration } from 'services/accounts/discord';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = await newDiscordIntegration({ query: req.query });
  res.redirect(url);
}

export default handler;
