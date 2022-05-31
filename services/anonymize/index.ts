import { generateRandomWordSlug } from '../../utilities/randomWordSlugs';
import { prisma } from '../../client';

async function getUsersFromAccountWithoutAlias(accountId: string) {
  return await prisma.users.findMany({
    where: { accountsId: accountId, anonymousAlias: null },
    select: { id: true, anonymousAlias: true },
  });
}

async function getUsersWithoutAlias() {
  return await prisma.users.findMany({
    where: { anonymousAlias: null },
    select: { id: true, anonymousAlias: true },
  });
}

async function anonymize(
  usersWithoutAlias: {
    anonymousAlias: string | null;
    id: string;
  }[]
) {
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
}

export async function anonymizeUsersFromAccount(accountId: string) {
  const usersWithoutAlias = await getUsersFromAccountWithoutAlias(accountId);
  console.log('usersWithoutAlias', usersWithoutAlias.length);
  await anonymize(usersWithoutAlias);
}

export async function anonymizeUsers() {
  const usersWithoutAlias = await getUsersWithoutAlias();
  console.log('usersWithoutAlias', usersWithoutAlias.length);
  await anonymize(usersWithoutAlias);
}
