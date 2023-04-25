/**
 * @jest-environment node
 */
import { v4 } from 'uuid';
import { create } from '@linen/factory';
import { attachHeaders, login } from '__tests__/pages/api/auth/login';
import { testApiHandler } from 'next-test-api-route-handler';
import * as notificationService from 'services/notifications';
import {
  notificationType,
  notifications,
  accounts,
  channels,
  auths,
  threads,
} from '@linen/database';
const handler = require('pages/api/notifications/[[...slug]]');

describe('user.notification', function () {
  let mockAuth: auths;
  let mockAuth2: auths;
  let token: string;
  let token2: string;
  let email = v4();
  let email2 = v4();

  let password = v4();
  let notification: notifications;
  let mockThread1: threads;
  let mockAccount: accounts;

  beforeAll(async () => {
    mockAuth = await create('auth', { email, password });
    mockAuth2 = await create('auth', { email: email2, password });

    mockAccount = await create('account', {
      slackDomain: v4(),
    });
    const mockChannel: channels = await create('channel', {
      accountId: mockAccount.id,
    });
    const response = await login({ email, password });
    token = response.body.token;
    const response2 = await login({ email: email2, password });
    token2 = response2.body.token;

    mockThread1 = await create('thread', {
      channelId: mockChannel.id,
      lastReplyAt: new Date().getTime(),
    });

    notification = await notificationService.create({
      authId: mockAuth.id,
      authorId: mockAuth.id,
      channelId: mockChannel.id,
      communityId: mockAccount.id,
      threadId: mockThread1.id,
      notificationType: notificationType.CHANNEL,
    });
    await notificationService.create({
      authId: mockAuth.id,
      authorId: mockAuth.id,
      channelId: mockChannel.id,
      communityId: mockAccount.id,
      notificationType: notificationType.CHANNEL,
    });
  });

  test('get notifications for user', async () => {
    await testApiHandler({
      handler,
      url: '/api/notifications',
      test: async ({ fetch }: any) => {
        const response = await fetch({
          method: 'GET',
          ...attachHeaders({ token }),
        });
        const notifications = await response.json();
        expect(notifications).toHaveLength(1);
        expect(notifications[0]).toMatchObject({
          id: notification.id,
          notificationType: notification.notificationType,
          threadId: notification.threadId,
          url: `http:///s/${mockAccount.slackDomain}/t/${mockThread1.incrementId}`,
        });
      },
    });
  });

  test('forbidden :: mark notification as read been another user', async () => {
    await testApiHandler({
      handler,
      url: '/api/notifications/mark',
      test: async ({ fetch }: any) => {
        const response = await fetch({
          method: 'PUT',
          body: JSON.stringify({
            threadId: notification.threadId,
          }),
          ...attachHeaders({ token: token2 }),
        });
        const result = await response.json();
        expect(result).toStrictEqual({ ok: false, result: 'not_found' });
      },
    });
  });

  test('not found :: mark inexistent notification as read', async () => {
    await testApiHandler({
      handler,
      url: '/api/notifications/mark',
      test: async ({ fetch }: any) => {
        const response = await fetch({
          method: 'PUT',
          body: JSON.stringify({
            threadId: v4(),
          }),
          ...attachHeaders({ token }),
        });
        const result = await response.json();
        expect(result).toStrictEqual({ ok: false, result: 'not_found' });
      },
    });
  });

  test('mark notification as read', async () => {
    await testApiHandler({
      handler,
      url: '/api/notifications/mark',
      test: async ({ fetch }: any) => {
        const response = await fetch({
          method: 'PUT',
          body: JSON.stringify({
            threadId: notification.threadId,
          }),
          ...attachHeaders({ token }),
        });
        const result = await response.json();
        expect(result).toStrictEqual({ ok: true, result: 'deleted' });
      },
    });
  });
});
