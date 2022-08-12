import type { NextApiRequest, NextApiResponse } from 'next';
import { captureExceptionAndFlush, withSentry } from 'utilities/sentry';
import { handleWebhook } from 'services/webhooks';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!!req.body.challenge) {
    res.status(200).json(req.body.challenge);
    return;
  }

  const result = await handleWebhook(req.body);
  if (result.error) {
    await captureExceptionAndFlush(result.error);
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.status(result.status).json({});
}

export default withSentry(handler);
