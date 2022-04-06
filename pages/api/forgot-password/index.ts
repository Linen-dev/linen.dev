import { NextApiRequest, NextApiResponse } from 'next/types';
import ApplicationMailer from '../../../mailers/ApplicationMailer';

function create(request: NextApiRequest, response: NextApiResponse) {
  const { email } = JSON.parse(request.body);
  if (!email) {
    return response.status(400).json({ error: 'Email is required' });
  }
  ApplicationMailer.send({
    to: email,
    subject: 'Linen.dev - Reset your password',
    text: 'Reset your password here: https://linen.dev/reset-password?token=1234',
    html: "Reset your password here: <a href='https://linen.dev/reset-password?token=1234'>https://linen.dev/reset-password?token=1234</a>",
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
