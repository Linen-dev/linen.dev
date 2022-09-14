import { withSentry } from '@sentry/nextjs';
import { unstable_getServerSession } from 'next-auth';
import { NextApiRequest, NextApiResponse } from 'next/types';
import { authOptions } from '../auth/[...nextauth]';
import { OnboardingUpdateAccount, PathDomainError } from 'services/onboarding';

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
    try {
      await OnboardingUpdateAccount(session?.user?.email, request.body);
      return response.status(200).json(request.body);
    } catch (error) {
      if (error instanceof PathDomainError) {
        return response.status(400).send(error.message);
      }
      throw error;
    }
  }

  return response.status(404).end();
}

export default withSentry(handler);
