/**
 * @jest-environment node
 */

import { v4 } from 'uuid';
import { testApiHandler } from 'next-test-api-route-handler';
import { createUserAndSignIn } from '__tests__/helpers';
import handler from 'pages/api/inbox';
import {
  createAccount,
  createChannel,
  createThread,
  createMessage,
  createUser,
} from '@linen/factory';

describe('channels', () => {
  describe('#index', () => {
    it('returns threads', async () => {
      const community = await createAccount({
        name: v4(),
        redirectDomain: v4(),
        slackDomain: v4(),
      });
      const channel = await createChannel({
        channelName: v4(),
        accountId: community.id,
      });
      const thread = await createThread({
        channelId: channel.id,
        sentAt: BigInt(new Date().getTime()),
        messageCount: 1,
        lastReplyAt: BigInt(new Date().getTime()),
      });

      await createMessage({
        threadId: thread.id,
        channelId: channel.id,
        body: v4(),
        sentAt: new Date(),
      });

      const { token } = await createUserAndSignIn(community.id, 'MEMBER');

      await testApiHandler({
        handler,
        url: '/api/inbox',
        test: async ({ fetch }: any) => {
          const response = await fetch({
            method: 'POST',
            body: JSON.stringify({
              communityName: community.slackDomain,
              limit: 10,
            }),
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
          expect(response.status).toEqual(200);
          const body = await response.json();
          expect(body.threads[0]).toMatchObject({
            id: thread.id,
          });
        },
      });
    });

    describe('when the community anonymizes users', () => {
      it('returns anonymized threads', async () => {
        const community = await createAccount({
          name: v4(),
          redirectDomain: v4(),
          anonymizeUsers: true,
          slackDomain: v4(),
        });
        const channel = await createChannel({
          channelName: v4(),
          accountId: community.id,
        });
        const thread = await createThread({
          channelId: channel.id,
          sentAt: BigInt(new Date().getTime()),
          messageCount: 1,
          lastReplyAt: BigInt(new Date().getTime()),
        });
        const user = await createUser({
          displayName: 'John Doe',
          anonymousAlias: 'Secret JD',
          isBot: false,
          isAdmin: false,
          accountsId: community.id,
        });
        await createMessage({
          threadId: thread.id,
          channelId: channel.id,
          body: v4(),
          sentAt: new Date(),
          usersId: user.id,
        });

        const { token } = await createUserAndSignIn(community.id, 'MEMBER');

        await testApiHandler({
          handler,
          url: '/api/inbox',
          test: async ({ fetch }: any) => {
            const response = await fetch({
              method: 'POST',
              body: JSON.stringify({
                communityName: community.slackDomain,
                limit: 10,
              }),
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            });
            expect(response.status).toEqual(200);
            const body = await response.json();
            expect(body.threads[0]).toMatchObject({
              id: thread.id,
            });
            expect(body.threads[0].messages[0].author).toMatchObject({
              displayName: 'Secret JD',
            });
          },
        });
      });
    });
  });
});
