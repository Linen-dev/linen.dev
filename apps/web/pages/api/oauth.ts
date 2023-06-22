import type { NextApiRequest, NextApiResponse } from 'next';
import { newSlackIntegration } from 'services/accounts/slack';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = await newSlackIntegration({ query: req.query });
  res.redirect(url);
}

export default handler;
