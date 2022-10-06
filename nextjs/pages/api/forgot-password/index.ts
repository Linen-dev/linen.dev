import { NextApiRequest, NextApiResponse } from 'next/types';
import ResetPasswordMailer from '../../../mailers/ResetPasswordMailer';
import { generateToken } from '../../../utilities/token';
import prisma from '../../../client';
import { getCurrentUrl } from '../../../utilities/domain';
import { captureException, withSentry } from '@sentry/nextjs';

async function create(request: NextApiRequest, response: NextApiResponse) {
  const { email } = JSON.parse(request.body);

  if (!email) {
    return response.status(400).json({ error: 'Email is required' });
  }
  try {
    const token = generateToken();

    const auth = await prisma.auths.findFirst({ where: { email } });

    if (!auth) {
      return response.status(200).json({});
    }

    await prisma.auths.update({
      where: { email },
      data: {
        token,
      },
    });

    await ResetPasswordMailer.send({
      to: email,
      host: getCurrentUrl(request),
      token,
    });
  } catch (exception) {
    captureException(exception);
    return response.status(200).json({});
  }

  return response.status(200).json({});
}

async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'POST') {
    return create(request, response);
  }
  return response.status(404).json({});
}

export default withSentry(handler);
