/**
 * @jest-environment node
 */

import { accounts } from '@linen/database';
import { create } from '@linen/factory';
import { ApiKeysService } from './api-keys';

describe('api-keys service', () => {
  const store = {
    account: {} as accounts,
    token: '',
    idToRevoke: '',
  };
  beforeAll(async () => {
    store.account = await create('account', {});
  });
  // create
  test('create api key', async () => {
    const { token } = await ApiKeysService.create({
      accountId: store.account.id,
      name: 'test',
    });
    expect(token).toBeDefined();
    store.token = token;
  });
  // list
  test('list account api-keys', async () => {
    const list = await ApiKeysService.list({ accountId: store.account.id });
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ name: 'test' });
    store.idToRevoke = list[0].id;
  });
  // get
  test('get account info through token', async () => {
    const apiKey = await ApiKeysService.getAccountByApiKey({
      apiKey: store.token,
    });
    expect(apiKey).toBeDefined();
    expect(apiKey?.account).toMatchObject(store.account);
  });
  // revoke
  test('revoke api-key', async () => {
    const revoke = await ApiKeysService.revoke({
      accountId: store.account.id,
      id: store.idToRevoke,
    });
    expect(revoke).toStrictEqual({ ok: true });
  });
});
