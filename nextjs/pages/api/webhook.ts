import type { NextApiRequest, NextApiResponse } from 'next';
import { withSentry } from 'utilities/sentry';
import { createWebhookJob } from 'queue/jobs';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!!req.body.challenge) {
    res.status(200).json(req.body.challenge);
    return;
  }

  await createWebhookJob(req.body);

  res.status(200).json({});
  return;
}

export default withSentry(handler);
