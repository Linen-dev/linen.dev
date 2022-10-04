import { withSentry } from '@sentry/nextjs';
import Session from 'services/session';
import { NextApiRequest, NextApiResponse } from 'next/types';
import { OnboardingCreateCommunity } from 'services/onboarding';

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await Session.find(request, response);
  if (!session?.user?.email) {
    return response.status(401).end();
  }
  if (request.method === 'POST') {
    const { id } = await OnboardingCreateCommunity(
      session?.user?.email,
      request.body
    );
    return response.status(200).json({ id });
  }
  return response.status(405).end();
}

export default withSentry(handler);
