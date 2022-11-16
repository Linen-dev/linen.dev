import { NextApiRequest, NextApiResponse } from 'next/types';
import { OnboardingCreateChannel } from 'services/onboarding';
import PermissionsService from 'services/permissions';

async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'POST') {
    const { channelName, accountId } = JSON.parse(request.body);
    const permissions = await PermissionsService.get({
      request,
      response,
      params: {
        communityId: accountId,
      },
    });
    if (!permissions.manage) {
      return response.status(401).json({});
    }
    const { id } = await OnboardingCreateChannel({
      channelName,
      accountId,
      userId: permissions.user?.id!,
    });
    return response.status(200).json({ channelName, id });
  }

  return response.status(405).json({});
}

export default handler;
