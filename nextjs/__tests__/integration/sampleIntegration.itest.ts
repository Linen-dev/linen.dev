import { createAccounts } from '../../bin/factory/account';
import { prisma } from '../../client';

// Each integration test file will get it's own schema
// See __mocks__/client.ts for more details
// This means it can be run in parrallel
// other options of setting up integration include:
// 1. wrapping tests in db transactions
// 2. making sure factory generate objects that don't collide

describe('hello world', () => {
  it('expects 1 to equal 1 ', async () => {
    const res = await prisma.accounts.findMany({});
    const accounts = await createAccounts();
    expect(1).toEqual(1);
  });
});
