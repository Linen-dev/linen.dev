import serialize from './account';
import { build } from '@linen/factory';
import { AccountType } from '@linen/types';

describe('#serialize', () => {
  it('serializes the account', () => {
    const account = serialize(build('account', { type: AccountType.PRIVATE }));
    expect(account.type).toEqual(AccountType.PRIVATE);
  });
});
