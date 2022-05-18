import { generateRandomWordSlug } from '@/utilities/randomWordSlugs';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../client';

async function getUsers(accountId: string) {
  return await prisma.users.findMany({
    where: { accountsId: accountId },
    select: { id: true, anonymousAlias: true },
  });
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const accountId = request.query.account_id as string;

  const users = await getUsers(accountId);
  console.log('users', users.length);

  const usersWithoutAlias = [];
  let listOfAliases: Record<string, boolean> = {};
  for (const user of users) {
    if (user.anonymousAlias) {
      listOfAliases[user.anonymousAlias] = true;
    } else {
      usersWithoutAlias.push(user);
    }
  }

  console.log('usersWithoutAlias', usersWithoutAlias.length);
  const updateUsersTransaction = [];
  for (const user of usersWithoutAlias) {
    while (true) {
      // generate a new random alias
      user.anonymousAlias = generateRandomWordSlug();
      // check if is not dup
      if (!listOfAliases[user.anonymousAlias]) {
        listOfAliases[user.anonymousAlias] = true;
        break;
      }
    }
    // persist
    updateUsersTransaction.push(
      prisma.users.update({
        data: { anonymousAlias: user.anonymousAlias },
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
