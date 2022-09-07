import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { stripProtocol } from '../../utilities/url';
import { dispatchAnonymizeRequest } from 'utilities/anonymizeMessages';
// The unstable_getServerSession only has the prefix unstable_ at the moment, because the API may change in the future. There are no known bugs at the moment and it is safe to use.
import { unstable_getServerSession, Session } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { captureExceptionAndFlush, withSentry } from 'utilities/sentry';
import { generateRandomWordSlug } from 'utilities/randomWordSlugs';
import { findAccountByEmail } from 'lib/models';
import { AccountType } from '@prisma/client';

export async function create({
  session,
}: {
  session: Session | null;
}): Promise<{ status: number; data?: { id: string } }> {
  const email = session?.user?.email;
  if (!email) {
    return { status: 401 };
  }

  try {
    const displayName = email.split('@').shift() || email;
    const { id } = await prisma.accounts.create({
      data: {
        auths: {
          connect: {
            email,
          },
        },
        users: {
          create: {
            isAdmin: true,
            isBot: false,
            anonymousAlias: generateRandomWordSlug(),
            auth: {
              connect: {
                email,
              },
            },
            displayName,
            externalUserId: null,
            profileImageUrl: null,
          },
        },
      },
    });
    return { status: 200, data: { id } };
  } catch (exception) {
    return { status: 500 };
  }
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

export async function update({
  params,
  session,
}: {
  params: {
    homeUrl?: string;
    docsUrl?: string;
    logoUrl?: string;
    redirectDomain?: string;
    brandColor?: string;
    googleAnalyticsId?: string;
    anonymizeUsers?: boolean;
    communityInviteUrl?: string;
    type?: AccountType;
  };
  session: Session | null;
}): Promise<{ status: number; data?: object }> {
  const email = session?.user?.email;
  if (!email) {
    return { status: 401 };
  }
  const account = await findAccountByEmail(email);
  if (!account) {
    return { status: 404 };
  }

  const {
    homeUrl,
    docsUrl,
    logoUrl,
    redirectDomain,
    brandColor,
    googleAnalyticsId,
    anonymizeUsers,
    communityInviteUrl,
    type,
  } = params;
  const freeAccount = {
    homeUrl,
    docsUrl,
    anonymizeUsers,
    communityInviteUrl,
    type,
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
      where: { id: account.id },
      data,
    });

    if (!!anonymizeUsers) {
      dispatchAnonymizeRequest(account.id);
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
    const session = await unstable_getServerSession(
      request,
      response,
      authOptions
    );
    const params = JSON.parse(request.body);
    return update({ params, session });
  },
};

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
