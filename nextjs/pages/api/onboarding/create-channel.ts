import { withSentry } from '@sentry/nextjs';
import Session from 'services/session';
import { NextApiRequest, NextApiResponse } from 'next/types';
import { OnboardingCreateChannel } from 'services/onboarding';

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await Session.find(request, response);

  if (!session?.user?.email) {
    return response.status(401).end();
  }

  if (request.method === 'POST') {
    const { channelName, id } = await OnboardingCreateChannel(
      session?.user?.email,
      request.body
    );
    return response.status(200).json({ channelName, id });
  }

  return response.status(405).end();
}

export default withSentry(handler);
