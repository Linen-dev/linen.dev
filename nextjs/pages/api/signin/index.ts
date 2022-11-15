import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from 'client';
import { generateHash, secureCompare } from 'utilities/password';

interface CreateParams {
  email: string;
  password: string;
}

export async function create(params: CreateParams) {
  const { email, password } = params;
  if (!email || !password) {
    return { status: 400 };
  }
  const auth = await prisma.auths.findUnique({ where: { email } });
  if (!auth) {
    return { status: 401 };
  }

  if (!secureCompare(auth.password, generateHash(password, auth.salt))) {
    return { status: 401 };
  }

  return { status: 200, data: {} };
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'POST') {
    const { status, data } = await create(request.body);
    return response.status(status).json(data || {});
  }
  return response.status(200).json({});
}
