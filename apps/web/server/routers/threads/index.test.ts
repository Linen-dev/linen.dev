jest.mock('services/threads');
import { testApiHandler } from 'next-test-api-route-handler';
import '__mocks__/tokens';
import { create } from '@linen/factory';
import { createUser } from '__tests__/login';
import handler from 'pages/api/threads/[[...slug]]';
import { attachHeaders } from '__tests__/pages/api/auth/login';
import { v4 } from 'uuid';
import { qs } from '@linen/utilities/url';
import { AccountType, ChatType } from '@linen/types';
import mockThreadsServices from 'services/threads';
import { postType } from './types';

const mockGet = jest.spyOn(mockThreadsServices, 'get');

describe('threads api (internal)', () => {
  const base = '/api/threads';
  const store: any = {};

  beforeAll(async () => {
    store.accountPrivate = await create('account', {
      type: AccountType.PRIVATE,
      chat: ChatType.MANAGERS,
    });
    store.accountPublic = await create('account', {
      type: AccountType.PUBLIC,
      chat: ChatType.MEMBERS,
    });

    store.adminPrivate = await createUser(store.accountPrivate.id, 'ADMIN');
    store.author = await createUser(store.accountPrivate.id, 'MEMBER');
    store.member = await createUser(store.accountPrivate.id, 'MEMBER');
    store.adminPublic = await createUser(store.accountPublic.id, 'ADMIN');
    store.memberPublic = await createUser(store.accountPublic.id, 'MEMBER');
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
      test(`GET ${base} => OK`, async () => {
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
      test(`GET ${base}/${v4()} => OK`, async () => {
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
      test(`POST ${base} => Unauthorized`, async () => {
        const result = await callApi({
          method: 'POST',
          token: undefined,
          url: base,
          body: { accountId: store.accountPublic.id },
        });
        expect(result).toBe(401);
      });
      test(`PUT ${base}/${v4()} => Unauthorized`, async () => {
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
      test(`GET ${base} => Unauthorized`, async () => {
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
      test(`GET ${base}/${v4()} => Unauthorized`, async () => {
        const result = await callApi({
          method: 'GET',
          token: undefined,
          url: `${base}/${v4()}?${qs({ accountId: store.accountPrivate.id })}`,
        });
        expect(result).toBe(401);
      });
      test(`POST ${base} => Unauthorized`, async () => {
        const result = await callApi({
          method: 'POST',
          token: undefined,
          url: base,
          body: { accountId: store.accountPrivate.id },
        });
        expect(result).toBe(401);
      });
      test(`PUT ${base}/${v4()} => Unauthorized`, async () => {
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

  describe(`admin user from private on same tenant`, () => {
    test(`GET ${base} => OK`, async () => {
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
    test(`GET ${base}/${v4()} => OK`, async () => {
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
    test(`POST ${base} => OK`, async () => {
      const body: postType & { accountId: string } = {
        accountId: store.accountPrivate.id,
        body: v4(),
        channelId: v4(),
      };
      const result = await callApi({
        method: 'POST',
        token: store.adminPrivate.token,
        url: base,
        body,
      });
      expect(result).toBe(200);
    });
    test(`PUT ${base}/${v4()} => OK`, async () => {
      const result = await callApi({
        method: 'PUT',
        token: store.adminPrivate.token,
        url: `${base}/${v4()}`,
        body: { accountId: store.accountPrivate.id, pinned: true },
      });
      expect(result).toBe(200);
    });
  });

  describe(`admin user from public account on private tenant`, () => {
    test(`GET ${base} => Forbidden`, async () => {
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
    test(`GET ${base}/${v4()} => Forbidden`, async () => {
      const result = await callApi({
        method: 'GET',
        token: store.adminPublic.token,
        url: `${base}/${v4()}?${qs({
          accountId: store.accountPrivate.id,
        })}`,
      });
      expect(result).toBe(403);
    });
    test(`POST ${base} => Forbidden`, async () => {
      const result = await callApi({
        method: 'POST',
        token: store.adminPublic.token,
        url: base,
        body: { accountId: store.accountPrivate.id },
      });
      expect(result).toBe(403);
    });
    test(`PUT ${base}/${v4()} => Forbidden`, async () => {
      const result = await callApi({
        method: 'PUT',
        token: store.adminPublic.token,
        url: `${base}/${v4()}`,
        body: { accountId: store.accountPrivate.id },
      });
      expect(result).toBe(403);
    });
  });

  describe(`author member user on same tenant`, () => {
    test(`GET ${base} => OK`, async () => {
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
    test(`GET ${base}/${v4()} => OK`, async () => {
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
    test(`POST ${base} => Forbidden`, async () => {
      const body: postType & { accountId: string } = {
        accountId: store.accountPrivate.id,
        body: v4(),
        channelId: v4(),
      };
      const result = await callApi({
        method: 'POST',
        token: store.author.token,
        url: base,
        body,
      });
      expect(result).toBe(403);
    });
    describe(`PUT ${base}/${v4()}`, () => {
      test(`update it own message => OK`, async () => {
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
      test(`pin a message should fail => Unauthorized`, async () => {
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

  describe(`member user from private on same tenant`, () => {
    test(`GET ${base} => OK`, async () => {
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
    test(`GET ${base}/${v4()} => OK`, async () => {
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
    test(`POST ${base} => Forbidden`, async () => {
      const body: postType & { accountId: string } = {
        accountId: store.accountPrivate.id,
        body: v4(),
        channelId: v4(),
      };
      const result = await callApi({
        method: 'POST',
        token: store.author.token,
        url: base,
        body,
      });
      expect(result).toBe(403);
    });
    test(`PUT ${base}/${v4()} => Forbidden`, async () => {
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

  describe(`member user from public on same tenant`, () => {
    test(`GET ${base} => OK`, async () => {
      const result = await callApi({
        method: 'GET',
        token: store.memberPublic.token,
        url: `${base}?${qs({
          accountId: store.accountPublic.id,
          channelId: v4(),
        })}`,
      });
      expect(result).toBe(200);
    });
    test(`GET ${base}/${v4()} => OK`, async () => {
      mockGet.mockResolvedValue({ id: 2 } as any);
      const result = await callApi({
        method: 'GET',
        token: store.memberPublic.token,
        url: `${base}/${v4()}?${qs({
          accountId: store.accountPublic.id,
        })}`,
      });
      expect(result).toBe(200);
      mockGet.mockClear();
    });
    test(`POST ${base} => OK`, async () => {
      const body: postType & { accountId: string } = {
        accountId: store.accountPublic.id,
        body: v4(),
        channelId: v4(),
      };
      const result = await callApi({
        method: 'POST',
        token: store.memberPublic.token,
        url: base,
        body,
      });
      expect(result).toBe(200);
    });
    describe(`PUT ${base}/${v4()}`, () => {
      test(`update it own message => OK`, async () => {
        mockGet.mockResolvedValue({
          messages: [
            {
              author: {
                id: store.memberPublic.user.id,
              },
            },
          ],
        } as any);
        const result = await callApi({
          method: 'PUT',
          token: store.memberPublic.token,
          url: `${base}/${v4()}`,
          body: { accountId: store.accountPublic.id },
        });
        expect(result).toBe(200);
        mockGet.mockClear();
      });
      test(`pin a message should fail => Unauthorized`, async () => {
        const result = await callApi({
          method: 'PUT',
          token: store.memberPublic.token,
          url: `${base}/${v4()}`,
          body: { accountId: store.accountPublic.id, pinned: true },
        });
        expect(result).toBe(403);
      });
    });
  });
});
