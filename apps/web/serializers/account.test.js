import serialize from './account';
import { build } from '__tests__/factory';
import { AccountType } from '@linen/types';

describe('#serialize', () => {
  it('serializes the account', () => {
    const account = serialize(build('account', { type: AccountType.PRIVATE }));
    expect(account.type).toEqual(AccountType.PRIVATE);
  });
});
