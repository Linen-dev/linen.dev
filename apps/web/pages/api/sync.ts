import type { NextApiRequest, NextApiResponse } from 'next';
import { createSyncJob } from 'queue/jobs';
import PermissionsService from 'services/permissions';
import { cors, preflight } from 'utilities/cors';

async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'OPTIONS') {
    return preflight(request, response, ['GET']);
  }
  cors(request, response);

  if (!request.query.account_id) {
    return response.status(400).json({});
  }

  const permissions = await PermissionsService.get({
    request,
    response,
    params: {
      communityId: request.query.account_id as string,
    },
  });
  if (!permissions.manage) {
    return response.status(401).json({});
  }

  const accountId = request.query.account_id as string;
  const fileLocation = request.query.file_location as string | undefined;

  await createSyncJob({
    account_id: accountId,
    file_location: fileLocation,
  });

  return response.status(200).json({});
}

export default handler;
