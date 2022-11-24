import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { stripProtocol } from '../../utilities/url';
import Session, { SessionType } from 'services/session';
import { generateRandomWordSlug } from 'utilities/randomWordSlugs';
import { findAccountByEmail } from 'lib/models';
import { AccountType, Roles } from '@linen/types';
import PermissionsService from 'services/permissions';

export async function create({
  session,
}: {
  session: SessionType | null;
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
            role: Roles.OWNER,
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
  session: SessionType | null;
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
  };
  const data = account.premium
    ? {
        ...freeAccount,
        brandColor,
        googleAnalyticsId,
        logoUrl,
        type,
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
    return { status: 500 };
  }
}

const handle = async (
  request: NextApiRequest,
  response: NextApiResponse,
  callback: any
) => {
  const session = await Session.find(request, response);
  const params = request.body ? JSON.parse(request.body) : {};
  const { status, data } = await callback({ params, session });
  return response.status(status).json(data || {});
};

async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'POST') {
    return handle(request, response, create);
  }
  if (request.method === 'PUT') {
    const { communityId } = JSON.parse(request.body);
    const permissions = await PermissionsService.get({
      request,
      response,
      params: { communityId },
    });
    if (!permissions.manage) {
      return response.status(401).json({});
    }
    return handle(request, response, update);
  }
  return response.status(404).json({});
}

export default handler;
