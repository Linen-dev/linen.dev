jest.mock('services/threads');
import { testApiHandler } from 'next-test-api-route-handler';
import '__mocks__/tokens';
import { create } from '__tests__/factory';
import { createUser } from '__tests__/factory/login';
import handler from 'pages/api/threads/[[...slug]]';
import { attachHeaders } from '__tests__/pages/api/auth/login';
import { v4 } from 'uuid';
import { qs } from 'utilities/url';
import { AccountType } from '@linen/types';
import mockThreadsServices from 'services/threads';

const mockGet = jest.spyOn(mockThreadsServices, 'get');

describe('threads api (internal)', () => {
  const base = '/api/threads';
  const store: any = {};

  beforeAll(async () => {
    store.accountPrivate = await create('account', {
      type: AccountType.PRIVATE,
    });
    store.accountPublic = await create('account', {
      type: AccountType.PUBLIC,
    });

    store.adminPrivate = await createUser(store.accountPrivate.id, 'ADMIN');
    store.author = await createUser(store.accountPrivate.id, 'MEMBER');
    store.member = await createUser(store.accountPrivate.id, 'MEMBER');
    store.adminPublic = await createUser(store.accountPublic.id, 'ADMIN');
  });

  async function callApi({
    url,
    method,
    body,
    token,
  }: {
    url: string;
    method: string;
    body?: any;
    token?: string;
  }) {
    return new Promise(async (res, rej) => {
      await testApiHandler({
        handler: handler as any,
        url: url,
        test: async ({ fetch }) => {
          try {
            const response = await fetch({
              method: method,
              ...attachHeaders({ token: token }),
              ...(body && {
                body: JSON.stringify(body),
              }),
            });
            console.log('response', response.statusText);
            res(response.status);
          } catch (error) {
            rej(error);
          }
        },
      });
    });
  }

  describe(`unauthenticated user`, () => {
    describe('public community', () => {
      test(`GET ${base}`, async () => {
        const result = await callApi({
          method: 'GET',
          token: undefined,
          url: `${base}?${qs({
            accountId: store.accountPublic.id,
            channelId: v4(),
          })}`,
        });
        expect(result).toBe(200);
      });
      test(`GET ${base}/${v4()}`, async () => {
        mockGet.mockResolvedValue({ id: 3 } as any);
        const result = await callApi({
          method: 'GET',
          token: undefined,
          url: `${base}/${v4()}?${qs({
            accountId: store.accountPublic.id,
          })}`,
        });
        expect(result).toBe(200);
        mockGet.mockClear();
      });
      test(`POST ${base}`, async () => {
        const result = await callApi({
          method: 'POST',
          token: undefined,
          url: base,
          body: { accountId: store.accountPublic.id },
        });
        expect(result).toBe(501);
      });
      test(`PUT ${base}/${v4()}`, async () => {
        const result = await callApi({
          method: 'PUT',
          token: undefined,
          url: `${base}/${v4()}`,
          body: { accountId: store.accountPublic.id },
        });
        expect(result).toBe(401);
      });
    });
    describe('private community', () => {
      test(`GET ${base}`, async () => {
        const result = await callApi({
          method: 'GET',
          token: undefined,
          url: `${base}?${qs({
            accountId: store.accountPrivate.id,
            channelId: v4(),
          })}`,
        });
        expect(result).toBe(401);
      });
      test(`GET ${base}/${v4()}`, async () => {
        const result = await callApi({
          method: 'GET',
          token: undefined,
          url: `${base}/${v4()}?${qs({ accountId: store.accountPrivate.id })}`,
        });
        expect(result).toBe(401);
      });
      test(`POST ${base}`, async () => {
        const result = await callApi({
          method: 'POST',
          token: undefined,
          url: base,
          body: { accountId: store.accountPrivate.id },
        });
        expect(result).toBe(501);
      });
      test(`PUT ${base}/${v4()}`, async () => {
        const result = await callApi({
          method: 'PUT',
          token: undefined,
          url: `${base}/${v4()}`,
          body: { accountId: store.accountPrivate.id },
        });
        expect(result).toBe(401);
      });
    });
  });

  describe(`admin user`, () => {
    test(`GET ${base}`, async () => {
      const result = await callApi({
        method: 'GET',
        token: store.adminPrivate.token,
        url: `${base}?${qs({
          accountId: store.accountPrivate.id,
          channelId: v4(),
        })}`,
      });
      expect(result).toBe(200);
    });
    test(`GET ${base}/${v4()}`, async () => {
      mockGet.mockResolvedValue({ id: 2 } as any);
      const result = await callApi({
        method: 'GET',
        token: store.adminPrivate.token,
        url: `${base}/${v4()}?${qs({
          accountId: store.accountPrivate.id,
        })}`,
      });
      expect(result).toBe(200);
      mockGet.mockClear();
    });
    test(`POST ${base}`, async () => {
      const result = await callApi({
        method: 'POST',
        token: store.adminPrivate.token,
        url: base,
        body: { accountId: store.accountPrivate.id },
      });
      expect(result).toBe(501);
    });
    test(`PUT ${base}/${v4()}`, async () => {
      const result = await callApi({
        method: 'PUT',
        token: store.adminPrivate.token,
        url: `${base}/${v4()}`,
        body: { accountId: store.accountPrivate.id },
      });
      expect(result).toBe(200);
    });
  });

  describe(`admin user from another tenant`, () => {
    test(`GET ${base}`, async () => {
      const result = await callApi({
        method: 'GET',
        token: store.adminPublic.token,
        url: `${base}?${qs({
          accountId: store.accountPrivate.id,
          channelId: v4(),
        })}`,
      });
      expect(result).toBe(403);
    });
    test(`GET ${base}/${v4()}`, async () => {
      const result = await callApi({
        method: 'GET',
        token: store.adminPublic.token,
        url: `${base}/${v4()}?${qs({
          accountId: store.accountPrivate.id,
        })}`,
      });
      expect(result).toBe(403);
    });
    test(`POST ${base}`, async () => {
      const result = await callApi({
        method: 'POST',
        token: store.adminPublic.token,
        url: base,
        body: { accountId: store.accountPrivate.id },
      });
      expect(result).toBe(501);
    });
    test(`PUT ${base}/${v4()}`, async () => {
      const result = await callApi({
        method: 'PUT',
        token: store.adminPublic.token,
        url: `${base}/${v4()}`,
        body: { accountId: store.accountPrivate.id },
      });
      expect(result).toBe(403);
    });
  });

  describe(`author member user`, () => {
    test(`GET ${base}`, async () => {
      const result = await callApi({
        method: 'GET',
        token: store.author.token,
        url: `${base}?${qs({
          accountId: store.accountPrivate.id,
          channelId: v4(),
        })}`,
      });
      expect(result).toBe(200);
    });
    test(`GET ${base}/${v4()}`, async () => {
      mockGet.mockResolvedValue({ id: 2 } as any);
      const result = await callApi({
        method: 'GET',
        token: store.author.token,
        url: `${base}/${v4()}?${qs({
          accountId: store.accountPrivate.id,
        })}`,
      });
      expect(result).toBe(200);
      mockGet.mockClear();
    });
    test(`POST ${base}`, async () => {
      const result = await callApi({
        method: 'POST',
        token: store.author.token,
        url: base,
        body: { accountId: store.accountPrivate.id },
      });
      expect(result).toBe(501);
    });
    describe(`PUT ${base}/${v4()}`, () => {
      test(`update it own message`, async () => {
        mockGet.mockResolvedValue({
          messages: [
            {
              author: {
                id: store.author.user.id,
              },
            },
          ],
        } as any);
        const result = await callApi({
          method: 'PUT',
          token: store.author.token,
          url: `${base}/${v4()}`,
          body: { accountId: store.accountPrivate.id },
        });
        expect(result).toBe(200);
        mockGet.mockClear();
      });
      test(`pin a message should fail`, async () => {
        const result = await callApi({
          method: 'PUT',
          token: store.author.token,
          url: `${base}/${v4()}`,
          body: { accountId: store.accountPrivate.id, pinned: true },
        });
        expect(result).toBe(403);
      });
    });
  });

  describe(`member user`, () => {
    test(`GET ${base}`, async () => {
      const result = await callApi({
        method: 'GET',
        token: store.author.token,
        url: `${base}?${qs({
          accountId: store.accountPrivate.id,
          channelId: v4(),
        })}`,
      });
      expect(result).toBe(200);
    });
    test(`GET ${base}/${v4()}`, async () => {
      mockGet.mockResolvedValue({ id: 2 } as any);
      const result = await callApi({
        method: 'GET',
        token: store.author.token,
        url: `${base}/${v4()}?${qs({
          accountId: store.accountPrivate.id,
        })}`,
      });
      expect(result).toBe(200);
      mockGet.mockClear();
    });
    test(`POST ${base}`, async () => {
      const result = await callApi({
        method: 'POST',
        token: store.author.token,
        url: base,
        body: { accountId: store.accountPrivate.id },
      });
      expect(result).toBe(501);
    });
    test(`PUT ${base}/${v4()}`, async () => {
      mockGet.mockResolvedValue({
        messages: [
          {
            author: {
              id: v4(),
            },
          },
        ],
      } as any);
      const result = await callApi({
        method: 'PUT',
        token: store.author.token,
        url: `${base}/${v4()}`,
        body: { accountId: store.accountPrivate.id },
      });
      expect(result).toBe(403);
      mockGet.mockClear();
    });
  });
});
