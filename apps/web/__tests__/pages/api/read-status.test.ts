import { create } from '@linen/factory';
import { v4 } from 'uuid';
import { testApiHandler } from 'next-test-api-route-handler';
import { login } from '__tests__/pages/api/auth/login';
import handler from 'pages/api/read-status';

type auths = { id: string };
type channels = { id: string };

describe.skip('read-status', function () {
  let mockAuth: auths;
  let mockChannel: channels;
  let token: string;
  let email = v4();
  let password = v4();
  const ts = Date.now();

  beforeAll(async () => {
    const mockAccount = await create('account');
    mockChannel = await create('channel', { accountId: mockAccount.id });
    mockAuth = await create('auth', { email, password });
    const { body } = await login({ email, password });
    token = body.token;
  });

  it.skip('mark timestamp as read for specific channel', async function () {
    await testApiHandler({
      handler,
      url: '/api/read-status',
      test: async ({ fetch }: any) => {
        const response = await fetch({
          method: 'POST',
          body: JSON.stringify({
            timestamp: ts,
            channelId: mockChannel.id,
          }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        expect(response.status).toEqual(200);
      },
    });
  });

  it.skip('get read mark for specific channel', async function () {
    await testApiHandler({
      handler,
      url: '/api/read-status?channelId=' + mockChannel.id,
      test: async ({ fetch }: any) => {
        const response = await fetch({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        expect(response.status).toEqual(200);
        const body = await response.json();
        console.log('body', body);
        expect(body).toStrictEqual({
          lastReadAt: String(ts),
          channelId: mockChannel.id,
        });
      },
    });
  });
});
