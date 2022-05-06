import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../client';
import { generateHash } from '../../utilities/password';
import { sendNotification } from '../../services/slack';
import { createAuth } from '../../lib/auth';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

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
  if (password.length < 6) {
    return response.status(400).json({
      error: 'Password too short',
    });
  }
  const auth = await prisma.auths.findFirst({ where: { email } });
  if (auth) {
    return response.status(200).json({});
  }
  const record = await createAuth({
    password,
    email,
  });
  try {
    await sendNotification('Email created: ' + email);
  } catch (e) {
    console.log('failed to send: ', e);
  }

  return response.status(200).json({ id: record.id });
}

async function update(request: NextApiRequest, response: NextApiResponse) {
  const { email, password, accountId } = JSON.parse(request.body);
  const auth = await prisma.auths.findFirst({ where: { email } });
  if (!auth) {
    return response.status(400).json({});
  }
  const hash = generateHash(password, auth.salt);
  if (hash !== auth.password) {
    return response.status(400).json({});
  }
  await prisma.auths.update({ where: { email }, data: { accountId } });
  return response.status(200).json({});
}

async function get(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession({ req, res }, authOptions);
  const email = session?.user?.email;
  if (!email) {
    return res.status(404).json({});
  }
  const auth = await prisma.auths.findFirst({
    where: { email },
    select: { accountId: true },
  });
  if (!auth) {
    return res.status(404).json({});
  }
  return res.status(200).json(auth);
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'POST') {
    return create(request, response);
  }
  if (request.method === 'PUT') {
    return update(request, response);
  }
  if (request.method === 'GET') {
    return get(request, response);
  }
  return response.status(404);
}
