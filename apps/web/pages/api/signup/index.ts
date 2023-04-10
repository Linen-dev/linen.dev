import { NextApiRequest, NextApiResponse } from 'next/types';
import { prisma } from '@linen/database';
import UsersService from 'services/users';
import Session from 'services/session';
import { normalize } from '@linen/utilities/string';
import { AccountType, Roles } from '@linen/types';
import { generateRandomWordSlug } from 'utilities/randomWordSlugs';
import { eventSignUp } from 'services/events/eventNewSignUp';
import { z } from 'zod';
import { ApiEvent, trackApiEvent } from 'utilities/ssr-metrics';

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  accountId: z.string().uuid().optional(),
  displayName: z.string().min(1).optional(),
});

async function create(request: NextApiRequest, response: NextApiResponse) {
  let body;
  try {
    body = JSON.parse(request.body);
  } catch (error) {
    body = request.body;
  }

  const requestBody = createSchema.safeParse(body);
  if (!requestBody.success) {
    return response.status(400).json({
      error: requestBody.error,
    });
  }

  const { email, password, accountId, displayName } = requestBody.data;

  const auth = await prisma.auths.findFirst({ where: { email } });
  if (auth) {
    return response
      .status(200)
      .json({ message: 'Account exists, please sign in!' });
  }
  const newAuth = await UsersService.createAuth({
    password,
    email,
  });

  if (accountId) {
    await joinCommunity({
      accountId,
      newAuthId: newAuth.id,
      displayName,
      email,
    });
  }

  try {
    await trackApiEvent(
      { req: { ...request, user: newAuth }, res: response },
      ApiEvent.sign_up
    );
    await eventSignUp(newAuth.id, email, newAuth.createdAt);
  } catch (e) {
    console.error('failed to send: ', e);
  }
  return response
    .status(200)
    .json({ message: 'Account created, please sign in!' });
}

async function joinCommunity({
  accountId,
  newAuthId,
  displayName,
  email,
}: {
  accountId: string;
  newAuthId: string;
  displayName?: string;
  email: string;
}) {
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
            displayName: normalize(
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

export default handler;
