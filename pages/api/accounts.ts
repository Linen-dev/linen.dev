import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../client';
import { stripProtocol } from '../../utilities/url';

async function create(request: NextApiRequest, response: NextApiResponse) {
  const { homeUrl, docsUrl, redirectDomain, brandColor } = JSON.parse(
    request.body
  );
  const account = await prisma.accounts.create({
    data: {
      homeUrl,
      docsUrl,
      redirectDomain: stripProtocol(redirectDomain),
      brandColor,
    },
  });
  return response.status(200).json(account);
}

async function update(request: NextApiRequest, response: NextApiResponse) {
  // TODO validate that the user in current session can update this account
  const {
    accountId,
    homeUrl,
    docsUrl,
    redirectDomain,
    brandColor,
    googleAnalyticsId,
  } = JSON.parse(request.body);
  const account = await prisma.accounts.findFirst({
    where: { id: accountId },
    select: { premium: true },
  });
  if (!account) {
    return response.status(404).json({});
  }
  const data = account.premium
    ? {
        homeUrl,
        docsUrl,
        redirectDomain: stripProtocol(redirectDomain),
        brandColor,
        googleAnalyticsId,
      }
    : {
        homeUrl,
        docsUrl,
        redirectDomain: stripProtocol(redirectDomain),
        brandColor,
      };
  const record = await prisma.accounts.update({
    where: { id: accountId },
    data,
  });
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
