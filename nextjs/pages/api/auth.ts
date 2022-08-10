import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../client';
import { sendNotification } from '../../services/slack';
import { createAuth } from '../../lib/auth';
import {
  Session,
  unstable_getServerSession as getServerSession,
} from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { accounts } from '@prisma/client';

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
    return response
      .status(200)
      .json({ message: 'Account exists, please sign in!' });
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
  return response
    .status(200)
    .json({ message: 'Account created, please sign in!' });
}

//pulled out the code so it is easier to test
export async function updateAuth(
  createAccount: boolean,
  session: Session | null
): Promise<{ status: number; result: any }> {
  const email = session?.user?.email;
  if (!email) {
    return { status: 401, result: {} };
  }
  const auth = await prisma.auths.findFirst({
    where: { email },
  });

  if (!auth) {
    return { status: 401, result: {} };
  }

  if (createAccount) {
    const account = await prisma.auths.update({
      select: { account: true },
      where: { email },
      data: {
        account: {
          upsert: {
            create: {},
            update: {},
          },
        },
      },
    });
    return { status: 200, result: account };
  }
  return { status: 200, result: {} };
}

async function update(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const { createAccount } = JSON.parse(req.body);

  const { status, result } = await updateAuth(createAccount, session);
  return res.status(status).json(result);
}

async function get(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
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
