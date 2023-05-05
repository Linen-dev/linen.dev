import { NextApiRequest, NextApiResponse } from 'next/types';
import ResetPasswordMailer from 'mailers/ResetPasswordMailer';
import { generateToken } from 'utilities/token';
import { prisma } from '@linen/database';
import { getCurrentUrl } from '@linen/utilities/domain';
import { cors, preflight } from 'utilities/cors';

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
    console.error(exception);
    return response.status(200).json({});
  }

  return response.status(200).json({});
}

async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'OPTIONS') {
    return preflight(request, response, ['POST']);
  }
  cors(request, response);
  if (request.method === 'POST') {
    return create(request, response);
  }
  return response.status(405).json({});
}

export default handler;
