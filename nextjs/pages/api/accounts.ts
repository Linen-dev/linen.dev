import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { stripProtocol } from '../../utilities/url';
import { dispatchAnonymizeRequest } from 'utilities/anonymizeMessages';
// The unstable_getServerSession only has the prefix unstable_ at the moment, because the API may change in the future. There are no known bugs at the moment and it is safe to use.
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { createAccountAndUser } from 'lib/account';
import { captureExceptionAndFlush, withSentry } from 'utilities/sentry';

async function create(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions);
  const email = session?.user?.email;
  if (!email) {
    return res.status(401);
  }

  const displayName = email.split('@').shift() || email;

  const account = await createAccountAndUser(email, displayName);

  return res.status(200).json({ id: account.id });
}

function isRedirectDomainNotUniqueError(exception: unknown) {
  return (
    exception instanceof PrismaClientKnownRequestError &&
    exception.code === 'P2002' &&
    exception.meta &&
    Array.isArray(exception.meta.target) &&
    exception.meta.target.includes('redirectDomain')
  );
}

async function update(request: NextApiRequest, response: NextApiResponse) {
  // TODO validate that the user in current session can update this account
  const {
    accountId,
    homeUrl,
    docsUrl,
    logoUrl,
    redirectDomain,
    brandColor,
    googleAnalyticsId,
    anonymizeUsers,
    communityInviteUrl,
  } = JSON.parse(request.body);
  const account = await prisma.accounts.findFirst({
    where: { id: accountId },
    select: { premium: true },
  });
  if (!account) {
    return response.status(404).json({});
  }
  const freeAccount = {
    homeUrl,
    docsUrl,
    anonymizeUsers,
    communityInviteUrl,
  };
  const data = account.premium
    ? {
        ...freeAccount,
        brandColor,
        googleAnalyticsId,
        logoUrl,
        ...(redirectDomain && {
          redirectDomain: stripProtocol(redirectDomain),
        }),
      }
    : freeAccount;

  try {
    const record = await prisma.accounts.update({
      where: { id: accountId },
      data,
    });

    if (!!anonymizeUsers) {
      dispatchAnonymizeRequest(accountId);
    }

    return response.status(200).json(record);
  } catch (exception: unknown) {
    if (isRedirectDomainNotUniqueError(exception)) {
      return response.status(400).json({
        error: 'Redirect domain is already in use',
      });
    }
    await captureExceptionAndFlush(exception);
    return response.status(500).json({});
  }
}

async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'POST') {
    return create(request, response);
  }
  if (request.method === 'PUT') {
    return update(request, response);
  }
  return response.status(404);
}

export default withSentry(handler);
