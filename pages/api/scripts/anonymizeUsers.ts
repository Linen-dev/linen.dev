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

  const usersWithoutAlias = [];
  let listOfAliases: Record<string, boolean> = {};
  for (const user of users) {
    if (user.anonymousAlias) {
      listOfAliases[user.anonymousAlias] = true;
    } else {
      usersWithoutAlias.push(user);
    }
  }

  const updateUsersTransaction = [];
  for (const user of usersWithoutAlias) {
    while (true) {
      // generate a new random alias
      user.anonymousAlias = generateRandomWordSlug();
      // check if is not dup
      if (!listOfAliases[user.anonymousAlias]) {
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
  }

  await prisma.$transaction(updateUsersTransaction);

  return response.status(200).json({});
}
