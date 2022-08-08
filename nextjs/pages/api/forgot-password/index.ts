import { NextApiRequest, NextApiResponse } from 'next/types';
import ApplicationMailer from '../../../mailers/ApplicationMailer';
import { generateToken } from '../../../utilities/token';
import prisma from '../../../client';
import { getCurrentUrl } from '../../../utilities/domain';

async function create(request: NextApiRequest, response: NextApiResponse) {
  const { email } = JSON.parse(request.body);

  if (!email) {
    return response.status(400).json({ error: 'Email is required' });
  }
  try {
    const token = generateToken();
    await prisma.auths.update({
      where: { email },
      data: {
        token,
      },
    });

    const HOST = getCurrentUrl(request);

    await ApplicationMailer.send({
      to: email,
      subject: 'Linen.dev - Reset your password',
      text: `Reset your password here: ${HOST}/reset-password?token=${token}`,
      html: `Reset your password here: <a href='${HOST}/reset-password?token=${token}'>${HOST}/reset-password?token=${token}</a>`,
    });
  } catch (exception) {
    return response.status(200).json({});
  }

  return response.status(200).json({});
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'POST') {
    return create(request, response);
  }
  return response.status(404);
}
