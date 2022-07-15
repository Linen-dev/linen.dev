import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { createAccount } from '../../lib/account';
import { stripProtocol } from '../../utilities/url';
import { dispatchAnonymizeRequest } from '@/utilities/anonymizeMessages';

async function create(request: NextApiRequest, response: NextApiResponse) {
  const { homeUrl, docsUrl, redirectDomain, brandColor } = JSON.parse(
    request.body
  );
  const account = await createAccount({
    homeUrl,
    docsUrl,
    redirectDomain,
    brandColor,
  });
  return response.status(200).json(account);
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
    return response.status(500).json({});
  }
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
  return response.status(404);
}
