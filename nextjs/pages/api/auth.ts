import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../client';
import { sendNotification } from '../../services/slack';
import { createAuth } from '../../lib/auth';
import { unstable_getServerSession as getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { generateToken } from '../../utilities/token';
import ApplicationMailer from 'mailers/ApplicationMailer';

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
    return response.status(200).json({
      message: auth.verified
        ? 'Account exists, please sign in!'
        : 'Account exists, please verify your email!',
    });
  }
  const verificationToken = generateToken();
  await createAuth({
    password,
    email,
    verificationToken,
  });
  const HOST =
    process.env.NEXTAUTH_URL ||
    request.headers.origin ||
    'http://localhost:3000';

  try {
    await sendNotification('Email created: ' + email);
  } catch (e) {
    console.log('failed to send: ', e);
  }

  await ApplicationMailer.send({
    to: email,
    subject: 'Linen - Verify your email',
    html: `Verify your account <a href="${HOST}/signin?verification-token=${verificationToken}">here</a>.`,
    text: `Verify your account here: ${HOST}/signin?verification-token=${verificationToken}`,
  });

  return response.status(200).json({
    message: "We've sent you a verification email. Please check your inbox.",
  });
}

async function update(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const { createAccount } = JSON.parse(req.body);

  const email = session?.user?.email;
  if (!email) {
    return res.status(401).json({});
  }
  const auth = await prisma.auths.findFirst({
    where: { email },
  });
  if (!auth) {
    return res.status(401).json({});
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
    return res.status(200).json(account);
  } else {
    return res.status(200).json({});
  }
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
