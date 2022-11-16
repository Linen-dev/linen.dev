import { NextApiRequest, NextApiResponse } from 'next/types';
import { getCurrentUrl } from 'utilities/domain';
import { OnboardingInviteTeam } from 'services/onboarding';
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
    const host = getCurrentUrl(request);
    const { email1, email2, email3 } = body;
    await OnboardingInviteTeam({
      accountId: body.accountId!,
      email1,
      email2,
      email3,
      createdByUserId: permissions.user?.id!,
      host,
    });
    return response.status(200).json({});
  }

  return response.status(405).json({});
}

export default handler;
