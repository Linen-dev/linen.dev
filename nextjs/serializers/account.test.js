import serialize from './account';
import { create } from '__tests__/factory';
import { AccountType } from '@prisma/client';

describe('#serialize', () => {
  it('serializes the account', () => {
    const account = serialize(create('account', { type: AccountType.PRIVATE }));
    expect(account.type).toEqual(AccountType.PRIVATE);
  });
});
