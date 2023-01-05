jest.mock('services/accounts');
import '__mocks__/tokens';
import { v4 as random } from 'uuid';
import { create } from '__tests__/factory';
import { attachHeaders } from '__tests__/pages/api/auth/login';
import { testApiHandler } from 'next-test-api-route-handler';
import handler from 'pages/api/accounts/[[...slug]]';
import { integrationDiscordType } from './accounts.types';
import { Roles } from 'server/middlewares/tenant';
import { createUser } from '__tests__/factory/login';

describe('accounts api', () => {
  describe('POST /api/accounts/integration/discord', () => {
    const cases: Record<string, any> = {
      'admin user expected 200 status': {},
      'owner user expected 200 status': {},
      'member user expected 403 status': {},
      'owner user from another tenant expected 403 status': {},
      'unauthenticated user expected 401 status': {},
    };

    beforeAll(async () => {
      const account = await create('account', {});
      const account2 = await create('account', {});

      const tokenAdmin = await createUser(account.id, Roles.ADMIN);
      const tokenMember = await createUser(account.id, Roles.MEMBER);
      const tokenOwner = await createUser(account.id, Roles.OWNER);
      const tokenOwnerAccount2 = await createUser(account2.id, Roles.OWNER);

      cases['admin user expected 200 status'] = {
        accountId: account.id,
        token: tokenAdmin.token,
        expected: 200,
      };
      cases['owner user expected 200 status'] = {
        accountId: account.id,
        token: tokenOwner.token,
        expected: 200,
      };
      cases['member user expected 403 status'] = {
        accountId: account.id,
        token: tokenMember.token,
        expected: 403,
      };
      cases['owner user from another tenant expected 403 status'] = {
        accountId: account.id,
        token: tokenOwnerAccount2.token,
        expected: 403,
      };
      cases['unauthenticated user expected 401 status'] = {
        accountId: account.id,
        token: '',
        expected: 401,
      };
    });

    for (const testCase of Object.keys(cases)) {
      test(testCase, async () => {
        await testApiHandler({
          handler: handler as any,
          url: '/api/accounts/integration/discord',
          test: async ({ fetch }) => {
            const body: integrationDiscordType = {
              accountId: cases[testCase].accountId,
              botToken: random(),
              discordServerId: random(),
            };
            const response = await fetch({
              method: 'POST',
              ...attachHeaders({ token: cases[testCase].token }),
              body: JSON.stringify(body),
            });
            expect(response?.status).toBe(cases[testCase].expected);
          },
        });
      });
    }
  });
});
