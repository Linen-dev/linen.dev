import { NextApiRequest, NextApiResponse } from 'next/types';
import ApplicationMailer from '../../../mailers/ApplicationMailer';

const HOST = process.env.NEXTAUTH_URL || 'http://localhost:3000';

function create(request: NextApiRequest, response: NextApiResponse) {
  const { email } = JSON.parse(request.body);
  if (!email) {
    return response.status(400).json({ error: 'Email is required' });
  }
  // const token = await Token.create({ email });
  ApplicationMailer.send({
    to: email,
    subject: 'Linen.dev - Reset your password',
    text: `Reset your password here: ${HOST}/reset-password?token=1234`,
    html: `Reset your password here: <a href='${HOST}/reset-password?token=1234'>${HOST}/reset-password?token=1234</a>`,
  });
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
