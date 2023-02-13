import handler from 'pages/api/inbox';
import { build } from '@linen/factory';
import type { NextApiRequest, NextApiResponse } from 'next';
import setup from '__tests__/spec-helpers/integration';
import { prisma } from '@linen/database';
import PermissionsService from 'services/permissions';

jest.mock('services/permissions');

setup({ truncationStrategy: 'cascade' });

describe('channels', () => {
  describe('#index', () => {
    it('returns threads', async () => {
      const community = await prisma.accounts.create({
        data: {
          name: 'foo',
          redirectDomain: 'foo',
        },
      });
      const channel = await prisma.channels.create({
        data: {
          channelName: 'general',
          accountId: community.id,
        },
      });
      const thread = await prisma.threads.create({
        data: {
          channelId: channel.id,
          sentAt: new Date().getTime(),
          messageCount: 1,
          lastReplyAt: new Date().getTime(),
        },
      });
      await prisma.messages.create({
        data: {
          threadId: thread.id,
          channelId: channel.id,
          body: 'foo',
          sentAt: new Date(),
        },
      });
      const request = build('request', {
        method: 'GET',
        query: {
          communityName: community.name,
        },
      }) as NextApiRequest;

      (PermissionsService.get as jest.Mock).mockReturnValue({ inbox: true });

      const response = build('response') as NextApiResponse;
      await handler(request, response);
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({
        threads: [expect.objectContaining({ id: thread.id })],
      });
    });

    describe('when the community anonymizes users', () => {
      it('returns anonymized threads', async () => {
        const community = await prisma.accounts.create({
          data: {
            name: 'foo',
            redirectDomain: 'foo',
            anonymizeUsers: true,
          },
        });
        const channel = await prisma.channels.create({
          data: {
            channelName: 'general',
            accountId: community.id,
          },
        });
        const thread = await prisma.threads.create({
          data: {
            channelId: channel.id,
            sentAt: new Date().getTime(),
            messageCount: 1,
            lastReplyAt: new Date().getTime(),
          },
        });
        const user = await prisma.users.create({
          data: {
            displayName: 'John Doe',
            anonymousAlias: 'Secret JD',
            isBot: false,
            isAdmin: false,
            accountsId: community.id,
          },
        });
        await prisma.messages.create({
          data: {
            threadId: thread.id,
            channelId: channel.id,
            body: 'foo',
            sentAt: new Date(),
            usersId: user.id,
          },
        });
        const request = build('request', {
          method: 'GET',
          query: {
            communityName: community.name,
          },
        }) as NextApiRequest;

        (PermissionsService.get as jest.Mock).mockReturnValue({ inbox: true });

        const response = build('response') as NextApiResponse;
        await handler(request, response);
        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.json).toHaveBeenCalledWith({
          threads: [
            expect.objectContaining({
              id: thread.id,
              messages: [
                expect.objectContaining({
                  author: expect.objectContaining({ displayName: 'Secret JD' }),
                }),
              ],
            }),
          ],
        });
      });
    });
  });
});
