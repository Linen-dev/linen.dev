/**
 * @jest-environment node
 */

import { create } from '@linen/factory';
import { v4 } from 'uuid';
import { testApiHandler } from 'next-test-api-route-handler';
import { login } from '__tests__/helpers';
import handler from 'pages/api/read-status';
import handlerChannel from 'pages/api/read-status/[channelId]';

type auths = { id: string };
type channels = { id: string };

describe('read-status', function () {
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

  it('mark timestamp as read for specific channel', async function () {
    await testApiHandler({
      handler,
      url: '/api/read-status',
      test: async ({ fetch }: any) => {
        const response = await fetch({
          method: 'POST',
          body: JSON.stringify({
            timestamp: ts,
            channelIds: [mockChannel.id],
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

  it('mark for specific channel', async function () {
    await testApiHandler({
      handler: handlerChannel,
      url: '/api/read-status/' + mockChannel.id,
      test: async ({ fetch }: any) => {
        const response = await fetch({
          method: 'PUT',
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
        const body = await response.json();
        expect(body).toMatchObject({
          lastReadAt: String(ts),
          channelId: mockChannel.id,
        });
      },
    });
  });
});
