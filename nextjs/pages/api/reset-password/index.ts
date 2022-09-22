import { NextApiRequest, NextApiResponse } from 'next/types';
import { captureException, withSentry } from '@sentry/nextjs';
import prisma from '../../../client';
import { generateHash } from '../../../utilities/password';

async function create(request: NextApiRequest, response: NextApiResponse) {
  const { password, token }: { password?: string; token?: string } = JSON.parse(
    request.body
  );
  if (!password) {
    return response.status(400).json({ error: 'Password is required' });
  }
  if (!token) {
    return response.status(400).json({ error: 'Token is required' });
  }
  const auth = await prisma.auths.findFirst({ where: { token } });
  if (!auth) {
    return response.status(200).json({});
  }
  const hash = generateHash(password, auth.salt);
  try {
    await prisma.auths.update({
      where: { id: auth.id },
      data: {
        password: hash,
        token: null,
      },
    });
  } catch (exception) {
    captureException(exception);
    response.status(200).json({});
  }
  return response.status(200).json({});
}

async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'POST') {
    return create(request, response);
  }
  return response.status(404);
}

export default withSentry(handler);
