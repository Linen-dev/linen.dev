import { withSentry } from '@sentry/nextjs';
import { unstable_getServerSession } from 'next-auth';
import { NextApiRequest, NextApiResponse } from 'next/types';
import { authOptions } from '../auth/[...nextauth]';
import { getCurrentUrl } from 'utilities/domain';
import { OnboardingInviteTeam } from 'services/onboarding';

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await unstable_getServerSession(
    request,
    response,
    authOptions
  );

  if (!session?.user?.email) {
    return response.status(401).end();
  }

  if (request.method === 'POST') {
    const host = getCurrentUrl(request);
    await OnboardingInviteTeam(session?.user?.email, request.body, host);
    return response.status(200).end();
  }

  return response.status(404).end();
}

export default withSentry(handler);
