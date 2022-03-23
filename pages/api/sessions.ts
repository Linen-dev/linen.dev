import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../client';
import { generateHash } from '../../utilities/password';

async function create(request: NextApiRequest, response: NextApiResponse) {
  const { email, password } = JSON.parse(request.body);
  if (!email) {
    return response.status(400).json({
      error: 'Please provide email',
    });
  }
  if (!password) {
    return response.status(400).json({
      error: 'Please provide password',
    });
  }
  const auth = await prisma.auths.findFirst({ where: { email } });
  if (!auth) {
    return response.status(400).json({
      error: 'Bad credentials',
    });
  }
  console.log(auth.password);
  console.log(generateHash(password, auth.salt));
  if (auth.password !== generateHash(password, auth.salt)) {
    return response.status(400).json({
      error: 'Bad credentials',
    });
  }
  // TODO create a session here
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
