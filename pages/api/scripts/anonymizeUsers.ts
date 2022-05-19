import { generateRandomWordSlug } from '@/utilities/randomWordSlugs';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../client';

async function getUsersWithoutAlias(accountId: string) {
  return await prisma.users.findMany({
    where: { accountsId: accountId, anonymousAlias: { equals: null } },
    select: { id: true, anonymousAlias: true },
  });
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const accountId = request.query.account_id as string;

  const usersWithoutAlias = await getUsersWithoutAlias(accountId);
  console.log('usersWithoutAlias', usersWithoutAlias.length);

  const updateUsersTransaction = [];
  for (const user of usersWithoutAlias) {
    // persist
    updateUsersTransaction.push(
      prisma.users.update({
        data: { anonymousAlias: generateRandomWordSlug() },
        where: { id: user.id },
      })
    );
    if (updateUsersTransaction.length === 100) {
      console.time('updateUsersTransaction');
      await Promise.all(updateUsersTransaction);
      console.timeEnd('updateUsersTransaction');
      updateUsersTransaction.splice(0, 100);
    }
  }

  console.time('updateUsersTransaction');
  updateUsersTransaction.length && (await Promise.all(updateUsersTransaction));
  console.timeEnd('updateUsersTransaction');

  return response.status(200).json({});
}
