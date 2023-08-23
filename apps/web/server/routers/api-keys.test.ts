/**
 * @jest-environment node
 */
import { v4 } from 'uuid';
import { create } from '@linen/factory';
import { login, attachHeaders } from '__tests__/helpers';
import { testApiHandler } from 'next-test-api-route-handler';
import { accounts, auths } from '@linen/database';
import handler from 'pages/api/api-keys/[[...slug]]';
import { createKeyType, revokeKeyType } from './api-keys.types';
import { qs } from '@linen/utilities/url';

describe('api-keys endpoints', () => {
  const store = {
    creds: { email: v4(), password: v4() },
    account: {} as accounts,
    auth: {} as auths,
    token: '',
    nonAdminToken: '',
    apiKeyIdToRevoke: '',
  };

  beforeAll(async () => {
    store.account = await create('account', {});
    store.auth = await create('auth', {
      ...store.creds,
    });
    await create('user', {
      accountsId: store.account.id,
      authsId: store.auth.id,
      role: 'ADMIN',
    });
    const response = await login({ ...store.creds });
    store.token = response.body.token;

    // non admin
    const creds = { email: v4(), password: v4() };
    const auth = await create('auth', {
      ...creds,
    });
    await create('user', {
      accountsId: store.account.id,
      authsId: auth.id,
      role: 'MEMBER',
    });
    store.nonAdminToken = await (await login({ ...creds })).body.token;
  });

  test('post', async () => {
    await testApiHandler({
      handler: handler as any,
      url: '/api/api-keys',
      test: async ({ fetch }: any) => {
        const body: createKeyType = {
          accountId: store.account.id,
          name: 'new-key',
        };
        const response = await fetch({
          method: 'POST',
          ...attachHeaders({ token: store.token }),
          body: JSON.stringify(body),
        });
        expect(response.status).toBe(200);
        const result = await response.json();
        expect(result.token).toBeDefined();
      },
    });
  });

  test('post with bad token', async () => {
    await testApiHandler({
      handler: handler as any,
      url: '/api/api-keys',
      test: async ({ fetch }: any) => {
        const body: createKeyType = {
          accountId: store.account.id,
          name: 'new-key',
        };
        const response = await fetch({
          method: 'POST',
          ...attachHeaders({ token: 'bad-token' }),
          body: JSON.stringify(body),
        });
        expect(response.status).toBe(401);
        const result = await response.json();
        expect(result.message).toBe('Unauthorized');
      },
    });
  });

  test('post without token', async () => {
    await testApiHandler({
      handler: handler as any,
      url: '/api/api-keys',
      test: async ({ fetch }: any) => {
        const body: createKeyType = {
          accountId: store.account.id,
          name: 'new-key',
        };
        const response = await fetch({
          method: 'POST',
          ...attachHeaders(),
          body: JSON.stringify(body),
        });
        expect(response.status).toBe(401);
        const result = await response.json();
        expect(result.message).toBe('Unauthorized');
      },
    });
  });

  test('post with non-admin role', async () => {
    await testApiHandler({
      handler: handler as any,
      url: '/api/api-keys',
      test: async ({ fetch }: any) => {
        const body: createKeyType = {
          accountId: store.account.id,
          name: 'new-key',
        };
        const response = await fetch({
          method: 'POST',
          ...attachHeaders({ token: store.nonAdminToken }),
          body: JSON.stringify(body),
        });
        expect(response.status).toBe(403);
        const result = await response.json();
        expect(result.message).toBe('Forbidden');
      },
    });
  });

  test('get', async () => {
    await testApiHandler({
      handler: handler as any,
      url: '/api/api-keys?' + qs({ accountId: store.account.id }),
      test: async ({ fetch }: any) => {
        const response = await fetch({
          method: 'GET',
          ...attachHeaders({ token: store.token }),
        });
        expect(response.status).toBe(200);
        const result = await response.json();
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('new-key');
        store.apiKeyIdToRevoke = result[0].id;
      },
    });
  });

  test('get with non-admin role', async () => {
    await testApiHandler({
      handler: handler as any,
      url: '/api/api-keys?' + qs({ accountId: store.account.id }),
      test: async ({ fetch }: any) => {
        const response = await fetch({
          method: 'GET',
          ...attachHeaders({ token: store.nonAdminToken }),
        });
        expect(response.status).toBe(403);
        const result = await response.json();
        expect(result.message).toBe('Forbidden');
      },
    });
  });

  test('get without token', async () => {
    await testApiHandler({
      handler: handler as any,
      url: '/api/api-keys?' + qs({ accountId: store.account.id }),
      test: async ({ fetch }: any) => {
        const response = await fetch({
          method: 'GET',
          ...attachHeaders(),
        });
        expect(response.status).toBe(401);
        const result = await response.json();
        expect(result.message).toBe('Unauthorized');
      },
    });
  });

  test('delete with non-admin role', async () => {
    await testApiHandler({
      handler: handler as any,
      url: '/api/api-keys',
      test: async ({ fetch }: any) => {
        const body: revokeKeyType = {
          accountId: store.account.id,
          id: store.apiKeyIdToRevoke,
        };
        const response = await fetch({
          method: 'DELETE',
          ...attachHeaders({ token: store.nonAdminToken }),
          body: JSON.stringify(body),
        });
        expect(response.status).toBe(403);
        const result = await response.json();
        expect(result).toMatchObject({ message: 'Forbidden' });
      },
    });
  });

  test('delete without token', async () => {
    await testApiHandler({
      handler: handler as any,
      url: '/api/api-keys',
      test: async ({ fetch }: any) => {
        const body: revokeKeyType = {
          accountId: store.account.id,
          id: v4(),
        };
        const response = await fetch({
          method: 'DELETE',
          body: JSON.stringify(body),
          ...attachHeaders(),
        });
        expect(response.status).toBe(401);
        const result = await response.json();
        expect(result.message).toBe('Unauthorized');
      },
    });
  });

  test('delete', async () => {
    await testApiHandler({
      handler: handler as any,
      url: '/api/api-keys',
      test: async ({ fetch }: any) => {
        const body: revokeKeyType = {
          accountId: store.account.id,
          id: store.apiKeyIdToRevoke,
        };
        const response = await fetch({
          method: 'DELETE',
          ...attachHeaders({ token: store.token }),
          body: JSON.stringify(body),
        });
        expect(response.status).toBe(200);
        const result = await response.json();
        expect(result.ok).toBe(true);
      },
    });
  });
});
