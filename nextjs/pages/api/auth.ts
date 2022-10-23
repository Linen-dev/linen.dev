import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../client';
import { sendNotification } from '../../services/slack';
import { createAuth } from '../../lib/auth';
import Session from 'services/session';
import { captureException, withSentry } from '@sentry/nextjs';
import { cleanUpString } from 'utilities/string';
import { AccountType, Roles } from '@prisma/client';
import { generateRandomWordSlug } from 'utilities/randomWordSlugs';
import { eventSignUp } from 'services/events/eventNewSignUp';

async function create(request: NextApiRequest, response: NextApiResponse) {
  const body = JSON.parse(request.body);
  const { email, password, accountId, displayName } = body;

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
  const newAuth = await createAuth({
    password,
    email,
  });

  if (accountId) {
    await joinCommunity(accountId, newAuth.id, displayName, email);
  }

  try {
    await eventSignUp(newAuth.id, email, newAuth.createdAt);
  } catch (e) {
    console.log('failed to send: ', e);
    captureException(e);
  }
  return response
    .status(200)
    .json({ message: 'Account created, please sign in!' });
}

async function joinCommunity(
  accountId: string,
  newAuthId: string,
  displayName: string,
  email: string
) {
  const account = await prisma.accounts.findUnique({
    where: { id: accountId },
  });
  if (account && account.type === AccountType.PUBLIC) {
    await prisma.auths.update({
      where: { id: newAuthId },
      data: {
        accountId,
        users: {
          create: {
            isAdmin: false,
            isBot: false,
            accountsId: accountId,
            displayName: cleanUpString(
              displayName || email.split('@').shift() || email
            ),
            anonymousAlias: generateRandomWordSlug(),
            role: Roles.MEMBER,
          },
        },
      },
    });
  }
}

async function update(req: NextApiRequest, res: NextApiResponse) {
  const session = await Session.find(req, res);
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
  const session = await Session.find(req, res);
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
  return res.status(200).json({ accountId: auth.accountId });
}

async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'POST') {
    return create(request, response);
  }
  if (request.method === 'PUT') {
    return update(request, response);
  }
  if (request.method === 'GET') {
    return get(request, response);
  }
  return response.status(404).json({});
}

export default withSentry(handler);
