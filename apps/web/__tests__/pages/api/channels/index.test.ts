/**
 * @jest-environment node
 */

import handler from 'pages/api/channels/[[...slug]]';
import { createAccount } from '@linen/factory';
import { prisma } from '@linen/database';
import { createUser as createLogin } from '__tests__/login';
import { v4 } from 'uuid';
import { testApiHandler } from 'next-test-api-route-handler';

describe('channels', () => {
  describe('#create', () => {
    it('creates a new channel', async () => {
      const community = await createAccount({
        name: v4(),
      });
      const { token } = await createLogin(community.id, 'ADMIN');

      const channelName = `c${v4()}`;

      await testApiHandler({
        handler,
        url: '/api/channels',
        test: async ({ fetch }: any) => {
          const response = await fetch({
            method: 'POST',
            body: JSON.stringify({
              accountId: community.id,
              channelName,
            }),
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
          expect(response.status).toBe(200);
          const channel = await prisma.channels.findFirst({
            where: {
              channelName,
              accountId: community.id,
            },
          });
          expect(channel).toBeDefined();
        },
      });
    });

    describe('when accountId is not present', () => {
      it('returns a 400', async () => {
        await testApiHandler({
          handler,
          url: '/api/channels',
          test: async ({ fetch }: any) => {
            const response = await fetch({
              method: 'POST',

              headers: {
                'Content-Type': 'application/json',
              },
            });
            expect(response.status).toBe(400);
            expect((await response.json()).message).toMatchInlineSnapshot(`
              "[
                {
                  "code": "invalid_type",
                  "expected": "string",
                  "received": "undefined",
                  "path": [
                    "accountId"
                  ],
                  "message": "Required"
                }
              ]"
              `);
          },
        });
      });
    });

    describe('when user does not have permissions', () => {
      it('returns a 401', async () => {
        const community = await createAccount({
          name: v4(),
        });
        const { token } = await createLogin(community.id, 'MEMBER');

        const channelName = `c${v4()}`;

        await testApiHandler({
          handler,
          url: '/api/channels',
          test: async ({ fetch }: any) => {
            const response = await fetch({
              method: 'POST',
              body: JSON.stringify({
                accountId: community.id,
                channelName,
              }),
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            });
            expect(response.status).toBe(403);
            expect(await response.json()).toMatchObject({
              message: 'Forbidden',
            });
          },
        });
      });
    });

    describe('when channel name is not unique for this community', () => {
      it('returns a 400', async () => {
        const community = await createAccount({
          name: v4(),
        });
        const { token } = await createLogin(community.id, 'ADMIN');

        const channelName = `c${v4()}`;

        await prisma.channels.create({
          data: {
            channelName,
            accountId: community.id,
          },
        });

        await testApiHandler({
          handler,
          url: '/api/channels',
          test: async ({ fetch }: any) => {
            const response = await fetch({
              method: 'POST',
              body: JSON.stringify({
                accountId: community.id,
                channelName,
              }),
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            });
            expect(response.status).toBe(400);
            expect(await response.json()).toMatchObject({
              message: 'Channel with this name already exists',
            });
          },
        });
      });
    });
  });
});
