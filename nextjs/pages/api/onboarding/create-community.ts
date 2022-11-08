import { NextApiRequest, NextApiResponse } from 'next/types';
import { OnboardingCreateCommunity } from 'services/onboarding';
import PermissionsService from 'services/permissions';

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const permissions = await PermissionsService.get({
    request,
    response,
    params: {},
  });

  if (!permissions.auth?.id) {
    return response.status(401).json({});
  }

  if (request.method === 'POST') {
    const { name } = JSON.parse(request.body);
    const { id } = await OnboardingCreateCommunity({
      authId: permissions.auth.id!,
      name,
    });
    return response.status(200).json({ id });
  }
  return response.status(405).json({});
}

export default handler;
