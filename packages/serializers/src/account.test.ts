import { serializeAccount } from './account';
import { build } from '@linen/factory-client';
import { AccountType } from '@linen/types';

describe('#serialize', () => {
  it('serializes the account', () => {
    const account = serializeAccount(
      build('account', { type: AccountType.PRIVATE })
    );
    expect(account.type).toEqual(AccountType.PRIVATE);
  });
});
