import { withSentry } from '@sentry/nextjs';
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
    return response.status(401).end();
  }

  if (request.method === 'POST') {
    try {
      await OnboardingUpdateAccount(body);
      return response.status(200).json(body);
    } catch (error) {
      if (error instanceof PathDomainError) {
        response.status(400).send(error.message);
        return response.end();
      }
      throw error;
    }
  }

  return response.status(405).end();
}

export default withSentry(handler);
