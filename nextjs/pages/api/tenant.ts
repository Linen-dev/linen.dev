import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthFromSession, UserSession } from 'utilities/session';
import prisma from '../../client';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const user = await getAuthFromSession(request, response);

  if (request.method === 'PUT') {
    await updateTenant(user, request.body);
    return response.status(200).json({ message: 'user tenant updated' });
  }

  return response.status(405).end();
}

async function updateTenant(user: UserSession, body: string) {
  const {
    tenant,
  }: {
    tenant: string;
  } = JSON.parse(body);

  const t = user.tenants.find((t) => t.accountId === tenant);
  if (!t) {
    throw 'tenant not found on user session';
  }

  const account = await prisma.accounts.findUnique({
    where: { id: t.accountId },
  });
  if (!account) {
    throw 'account not found';
  }

  const auth = await prisma.auths.findUnique({
    where: { id: user.authId },
    include: { users: true },
  });
  if (!auth) {
    throw 'auth not found';
  }

  const userToUpdate = auth.users.find((u) => u.accountsId === account.id);
  if (!userToUpdate) {
    throw 'user not found';
  }

  return await prisma.auths.update({
    where: { id: user.authId },
    data: { accountId: account.id },
  });
}
