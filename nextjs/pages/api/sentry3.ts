import * as Sentry from '@sentry/nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    throw new Error(
      '[test] api, forced failure, catch exception with flush on middleware'
    );
  } catch (error) {
    Sentry.captureException(error);
  }
  res.status(200).json({ message: 'exception was captured without flush' });
}

export default Sentry.withSentry(handler);
