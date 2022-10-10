import { withSentry } from '@sentry/nextjs';
import { NextApiRequest, NextApiResponse } from 'next/types';
import { OnboardingCreateCommunity } from 'services/onboarding';
import PermissionsService from 'services/permissions';

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const permissions = await PermissionsService.get({
    request,
    response,
    params: {},
  });

  if (!permissions.user?.authId) {
    return response.status(401).end();
  }

  if (request.method === 'POST') {
    const { name } = JSON.parse(request.body);
    const { id } = await OnboardingCreateCommunity({
      authId: permissions.user?.authId!,
      name,
    });
    response.status(200).json({ id });
    return response.end();
  }
  return response.status(405).end();
}

export default withSentry(handler);
