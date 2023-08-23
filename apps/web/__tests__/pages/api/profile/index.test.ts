/**
 * @jest-environment node
 */

jest.mock('body-parser', () => ({
  json: () => (_: any, _2: any, next: any) => next(),
}));
import handler from 'pages/api/profile/[[...slug]]';
import { createAccount } from '@linen/factory';
import { prisma } from '@linen/database';
import { testApiHandler } from 'next-test-api-route-handler';
import { createUserAndSignIn } from '__tests__/helpers';

describe('create', () => {
  let token: string;
  let userId: string;
  beforeAll(async () => {
    const account = await createAccount();
    const user = await createUserAndSignIn(account.id, 'MEMBER');
    token = user.token;
    userId = user.user.id;
  });
  it('returns 400 if display name param is an empty string', async () => {
    await testApiHandler({
      handler,
      url: '/api/profile',
      test: async ({ fetch }: any) => {
        const response = await fetch({
          method: 'PUT',
          body: JSON.stringify({
            displayName: '',
          }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        expect(response.status).toEqual(400);
        const body = await response.json();
        expect(body.message).toContain(
          'String must contain at least 1 character(s)'
        );
      },
    });
  });

  it('returns 200 when display name is valid', async () => {
    await testApiHandler({
      handler,
      url: '/api/profile',
      test: async ({ fetch }: any) => {
        const response = await fetch({
          method: 'PUT',
          body: JSON.stringify({
            displayName: 'TestOne',
          }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        expect(response.status).toEqual(200);
        const body = await response.json();
        expect(body.ok).toBe(true);
        const user = await prisma.users.findUnique({
          where: {
            id: userId,
          },
        });
        expect(user?.displayName).toEqual('TestOne');
      },
    });
  });
});
