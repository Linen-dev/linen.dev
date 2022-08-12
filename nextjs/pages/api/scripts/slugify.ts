import { NextApiRequest, NextApiResponse } from 'next/types';
import { slugify } from '../../../services/slugify';
import { withSentry } from 'utilities/sentry';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const response = await slugify();
  return res.status(response.status).json(response.body);
}

export default withSentry(handler);
