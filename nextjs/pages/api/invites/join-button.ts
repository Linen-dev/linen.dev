import type { NextApiRequest, NextApiResponse } from 'next';
import PermissionsService from 'services/permissions';
import { cleanUpString } from 'utilities/string';
import { prisma } from 'client';
import { Roles } from '@prisma/client';
import { generateRandomWordSlug } from 'utilities/randomWordSlugs';

type Props = { communityId: string };
type PostProps = Props & {};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { communityId }: PostProps = JSON.parse(request.body);

  const permissions = await PermissionsService.get({
    request,
    response,
    params: { communityId },
  });

  if (!permissions.access) {
    return response.status(401).end();
  }

  if (request.method === 'POST') {
    await joinCommunity(
      permissions.user?.email!,
      communityId,
      permissions.user?.authId!
    );
    return response.status(200).end();
  }

  return response.status(405).end();
}

async function joinCommunity(email: string, accountId: string, authId: string) {
  const user = await findUser(accountId, authId);
  if (!!user) {
    await checkoutTenant(authId, accountId);
    return { data: 'user already belongs to tenant' };
  }
  const displayName = cleanUpString(email.split('@').shift() || email);
  await createUser(accountId, authId, displayName);
  await checkoutTenant(authId, accountId);
}

async function createUser(
  accountId: string,
  authId: string,
  displayName: string
) {
  await prisma.users.create({
    data: {
      isAdmin: false,
      isBot: false,
      accountsId: accountId,
      authsId: authId,
      displayName,
      anonymousAlias: generateRandomWordSlug(),
      role: Roles.MEMBER,
    },
  });
}

async function findUser(accountId: string, authId: string) {
  return await prisma.users.findFirst({
    where: {
      accountsId: accountId,
      authsId: authId,
    },
  });
}

async function checkoutTenant(authId: string, accountId: string) {
  await prisma.auths.update({ where: { id: authId }, data: { accountId } });
}
