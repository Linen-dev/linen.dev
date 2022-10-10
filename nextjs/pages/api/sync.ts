import { withSentry } from '@sentry/nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createSyncJob } from 'queue/jobs';
import PermissionsService from 'services/permissions';

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const permissions = await PermissionsService.get({
    request,
    response,
    params: {
      communityId: request.query.account_id,
    },
  });
  if (!permissions.manage) {
    return response.status(401).end();
  }

  const accountId = request.query.account_id as string;
  const fileLocation = request.query.file_location as string | undefined;

  await createSyncJob({
    account_id: accountId,
    file_location: fileLocation,
  });

  return response.status(200).end();
}

export default withSentry(handler);
