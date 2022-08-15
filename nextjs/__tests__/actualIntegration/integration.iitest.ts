import { createAccounts } from '../../bin/factory/account';
import { prisma } from '../../client';

describe('hello world', () => {
  it('expects 1 to equal 1 ', async () => {
    const res = await prisma.accounts.findMany({});
    const accounts = await createAccounts();
    expect(1).toEqual(1);
  });
});
