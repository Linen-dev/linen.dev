import { withSentry } from '@sentry/nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  throw new Error('[test] api, forced failure, unhandled exception');
}

export default withSentry(handler);
