import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../client';
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
    slackInviteUrl,
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
    slackInviteUrl,
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

  const record = await prisma.accounts.update({
    where: { id: accountId },
    data,
  });

  if (!!anonymizeUsers) {
    dispatchAnonymizeRequest(accountId);
  }

  return response.status(200).json(record);
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
