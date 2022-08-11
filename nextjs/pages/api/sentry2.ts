import * as Sentry from '@sentry/nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    throw new Error('[test] api, forced failure, catch exception');
  } catch (error) {
    Sentry.captureException(error);
  }

  // Flushing before returning is necessary if deploying to Vercel, see
  // https://vercel.com/docs/platform/limits#streaming-responses
  await Sentry.flush();
  res.status(200).json({ message: 'exception was captured' });
}

export default handler;
