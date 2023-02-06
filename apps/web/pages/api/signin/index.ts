import { NextApiRequest, NextApiResponse } from 'next/types';
import { prisma } from '@linen/database';
import { generateHash, secureCompare } from '@linen/utilities/password';

interface CreateParams {
  email: string;
  password: string;
}

// we could make this more secure in few ways
// some of these might be good enough for some automated attacks
// 1. rate limit the /signin endpoint, e.g. w/ redis [high effort]
// 2. detect and block suspicious traffic [high effort]
// 3. force endpoint delay after each attempt [med effort]
// 4. allow N attempts per user, lock after that [med effort]
// 5. only allow certain clients, e.g. embed token within desktop app during build [med effort]
// 6. implement and force 2FA for all users [high effort]
// 7. require complex passwords [low effort]

// we could also make this process a bit more complex too to at least annoy an attacker
// 1. increase complexity by requiring csrf token from /api/auth/csrf [low effort]
// 2. increase complexity by keeping an extra token in the repo [low effort]
// 3. increase complexity, encode password on the client, decode here [low effort]

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
