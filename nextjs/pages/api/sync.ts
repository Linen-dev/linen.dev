import { withSentry } from '@sentry/nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createSyncJob } from 'queue/jobs';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const accountId = req.query.account_id as string;
  const fileLocation = req.query.file_location as string | undefined;

  await createSyncJob({
    account_id: accountId,
    file_location: fileLocation,
  });

  return res.status(200).json({});
}

export default withSentry(handler);
