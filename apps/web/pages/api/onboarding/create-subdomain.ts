import { NextApiRequest, NextApiResponse } from 'next/types';
import { OnboardingUpdateAccount, PathDomainError } from 'services/onboarding';
import PermissionsService from 'services/permissions';

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const body = JSON.parse(request.body);
  const permissions = await PermissionsService.get({
    request,
    response,
    params: {
      communityId: body.accountId,
    },
  });

  if (!permissions.manage) {
    return response.status(401).json({});
  }

  if (request.method === 'POST') {
    try {
      await OnboardingUpdateAccount(body);
      return response.status(200).json(body);
    } catch (error) {
      if (error instanceof PathDomainError) {
        return response.status(400).json({ error: error.message });
      }
      console.error(error);
      return response.status(500).json({});
    }
  }

  return response.status(405).json({});
}

export default handler;
