import type { Roles } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from 'pages/api/auth/[...nextauth]';
import prisma from '../client';

export async function getSession(
  request: NextApiRequest,
  response: NextApiResponse
) {
  return await unstable_getServerSession(request, response, authOptions);
}

export type UserSession = {
  accountId: string | null;
  userId?: string;
  role?: Roles;
  authId: string;
  email: string;
  tenants: {
    userId: string;
    role: Roles;
    accountId: string;
    accountName: string | null;
  }[];
};

export async function getAuthFromSession(
  request: NextApiRequest,
  response: NextApiResponse
): Promise<UserSession> {
  const session = await getSession(request, response);
  if (!session || !session?.user?.email) {
    throw 'missing session';
  }

  const auth = await prisma.auths.findUnique({
    where: { email: session.user.email },
    include: {
      users: { include: { account: { select: { id: true, name: true } } } },
    },
  });
  if (!auth) {
    throw 'auth not found';
  }

  const user = auth?.users?.find((u) => u.accountsId === auth.accountId);

  return {
    accountId: auth.accountId,
    authId: auth.id,
    email: auth.email,
    userId: user?.id,
    role: user?.role,
    tenants: auth?.users?.map(({ account, id, role }) => ({
      userId: id,
      role,
      accountId: account.id,
      accountName: account.name,
    })),
  };
}
