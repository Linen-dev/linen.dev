import { AccountType, prisma, accounts } from '@linen/database';

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
