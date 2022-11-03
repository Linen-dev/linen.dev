import type { accounts } from '@prisma/client';
import { AccountType } from '@prisma/client';
import prisma from 'client';

export default async function createAccount(
  options?: Partial<accounts>
): Promise<accounts> {
  return prisma.accounts.create({
    data: {
      type: AccountType.PUBLIC,
      name: 'Linen',
      ...options,
    },
  });
}
