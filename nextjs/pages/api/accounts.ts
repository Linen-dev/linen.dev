import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { stripProtocol } from '../../utilities/url';
import { dispatchAnonymizeRequest } from 'utilities/anonymizeMessages';
// The unstable_getServerSession only has the prefix unstable_ at the moment, because the API may change in the future. There are no known bugs at the moment and it is safe to use.
import { unstable_getServerSession, Session } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { createAccountAndUser } from 'lib/account';
import { captureExceptionAndFlush, withSentry } from 'utilities/sentry';

export async function create({
  session,
}: {
  session: Session | null;
}): Promise<{ status: number; data?: { id: string } }> {
  const email = session?.user?.email;
  if (!email) {
    return { status: 401 };
  }

  const displayName = email.split('@').shift() || email;

  const account = await createAccountAndUser(email, displayName);

  return { status: 200, data: { id: account.id } };
}

const handlers = {
  async create(request: NextApiRequest, response: NextApiResponse) {
    const session = await unstable_getServerSession(
      request,
      response,
      authOptions
    );
    const { status, data } = await create({ session });
    if (data) {
      return response.status(status).json(data);
    }
    return response.status(status);
  },
  async update(request: NextApiRequest, response: NextApiResponse) {
    const params = JSON.parse(request.body);
    return update({ params });
  },
};

function isRedirectDomainNotUniqueError(exception: unknown) {
  return (
    exception instanceof PrismaClientKnownRequestError &&
    exception.code === 'P2002' &&
    exception.meta &&
    Array.isArray(exception.meta.target) &&
    exception.meta.target.includes('redirectDomain')
  );
}

export async function update({ params }: any) {
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
  } = params;
  const account = await prisma.accounts.findFirst({
    where: { id: accountId },
    select: { premium: true },
  });
  if (!account) {
    return { status: 404 };
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

    return { status: 200, data: record };
  } catch (exception: unknown) {
    if (isRedirectDomainNotUniqueError(exception)) {
      return {
        status: 400,
        data: {
          error: 'Redirect domain is already in use',
        },
      };
    }
    await captureExceptionAndFlush(exception);
    return { status: 500 };
  }
}

async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'POST') {
    return handlers.create(request, response);
  }
  if (request.method === 'PUT') {
    return handlers.update(request, response);
  }
  return response.status(404);
}

export default withSentry(handler);
