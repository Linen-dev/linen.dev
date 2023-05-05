import { NextApiRequest, NextApiResponse } from 'next/types';
import { prisma } from '@linen/database';
import { generateHash } from '@linen/utilities/password';
import { cors, preflight } from 'utilities/cors';

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
    console.error(exception);
    response.status(200).json({});
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
