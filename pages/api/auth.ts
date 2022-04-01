import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../client';
import { generateHash, generateSalt } from '../../utilities/password';

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
  const salt = generateSalt();
  const hash = generateHash(password, salt);
  const record = await prisma.auths.create({
    data: {
      salt,
      password: hash,
      email,
    },
  });
  return response.status(200).json({ id: record.id });
}

async function update(request: NextApiRequest, response: NextApiResponse) {
  // TODO - validate request
  const { id, accountId } = JSON.parse(request.body);
  await prisma.auths.update({ where: { id }, data: { accountId } });
  return response.status(200).json({});
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
  return response.status(404);
}
