/**
 * @jest-environment node
 */
import { testApiHandler } from 'next-test-api-route-handler';
import { create } from '@linen/factory';
import { createUser } from '__tests__/login';
import handler from 'pages/api/users/[[...slug]]';
import { attachHeaders } from '__tests__/pages/api/auth/login';
import { prisma } from '@linen/database';
import { qs } from '@linen/utilities/url';
import { v4 } from 'uuid';

describe('users api (internal)', () => {
  const base = '/api/users';
  const store: {
    account: { id: string };
    admin: { token: string; user: { id: string } };
    member: { user: { id: string } };
    invite: { id: string };
  } = {
    account: { id: '' },
    admin: { token: '', user: { id: '' } },
    member: { user: { id: '' } },
    invite: { id: '' },
  };

  beforeAll(async () => {
    store.account = await create('account', {});
    store.admin = await createUser(store.account.id, 'ADMIN');
    store.member = await createUser(store.account.id, 'MEMBER');
    store.invite = await prisma.invites.create({
      data: {
        email: v4(),
        accountsId: store.account.id,
        createdById: store.admin.user.id,
      },
    });
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

  describe(`delete members`, () => {
    test(`delete existent member`, async () => {
      const result = await callApi({
        method: 'DELETE',
        token: store.admin.token,
        url: `${base}?${qs({
          accountId: store.account.id,
          userId: store.member.user.id,
        })}`,
      });
      expect(result).toBe(200);
      const validate = await prisma.users.findFirst({
        where: { id: store.member.user.id },
      });
      expect(validate?.authsId).toBe(null);
    });

    test(`delete invite`, async () => {
      const result = await callApi({
        method: 'DELETE',
        token: store.admin.token,
        url: `${base}?${qs({
          accountId: store.account.id,
          userId: store.invite.id,
        })}`,
      });
      expect(result).toBe(200);
      const validate = await prisma.invites.findFirst({
        where: { id: store.invite.id },
      });
      expect(validate).toBe(null);
    });
  });
});
