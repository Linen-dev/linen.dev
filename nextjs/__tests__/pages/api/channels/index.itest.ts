import handler from 'pages/api/channels';
import { create } from '__tests__/factory';
import type { NextApiRequest, NextApiResponse } from 'next';
import setup from '__tests__/spec-helpers/integration';
import prisma from 'client';
import PermissionsService from 'services/permissions';

jest.mock('services/permissions');

setup({ truncationStrategy: 'cascade' });

describe('channels', () => {
  describe('#create', () => {
    it('creates a new channel', async () => {
      const community = await prisma.accounts.create({
        data: {
          name: 'foo',
        },
      });
      const request = create('request', {
        method: 'POST',
        body: {
          communityId: community.id,
          channelName: 'bar',
        },
      }) as NextApiRequest;

      (PermissionsService.get as jest.Mock).mockReturnValue({ manage: true });

      const response = create('response') as NextApiResponse;
      await handler(request, response);
      expect(response.status).toHaveBeenCalledWith(200);
      const channel = await prisma.channels.findFirst({
        where: {
          channelName: 'bar',
          accountId: community.id,
        },
      });
      expect(channel).toBeDefined();
    });

    describe('when community id is not present', () => {
      it('returns a 400', async () => {
        const request = create('request');
        const response = create('response');
        await handler(request, response);
        expect(response.status).toHaveBeenCalledWith(400);
      });
    });

    describe('when user does not have permissions', () => {
      it('returns a 401', async () => {
        const community = await prisma.accounts.create({
          data: {
            name: 'foo',
          },
        });
        const request = create('request', {
          method: 'POST',
          body: {
            communityId: community.id,
          },
        });

        (PermissionsService.get as jest.Mock).mockReturnValue({
          manage: false,
        });

        const response = create('response');
        await handler(request, response);
        expect(response.status).toHaveBeenCalledWith(401);
      });
    });

    describe('when channel name is not unique for this community', () => {
      it('returns a 400', async () => {
        const community = await prisma.accounts.create({
          data: {
            name: 'foo',
          },
        });
        await prisma.channels.create({
          data: {
            channelName: 'bar',
            accountId: community.id,
          },
        });
        const request = create('request', {
          method: 'POST',
          body: {
            communityId: community.id,
            channelName: 'bar',
          },
        }) as NextApiRequest;

        (PermissionsService.get as jest.Mock).mockReturnValue({ manage: true });

        const response = create('response') as NextApiResponse;
        await handler(request, response);
        expect(response.status).toHaveBeenCalledWith(400);
      });
    });
  });
});
