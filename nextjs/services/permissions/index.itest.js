import PermissionsService from '.';
import prisma from 'client';
import Session from '../session';
import { AccountType } from '@prisma/client';
import setup from '__tests__/spec-helpers/integration';

setup({ truncationStrategy: 'delete' });

jest.mock('../session');

describe('#access', () => {
  describe('when the community is public', () => {
    it('returns true', async () => {
      const context = {
        params: { communityName: 'foo' },
      };
      await prisma.accounts.create({
        data: {
          name: 'foo',
          slackDomain: 'foo',
          type: AccountType.PUBLIC,
        },
      });
      expect(await PermissionsService.access(context)).toEqual(true);
    });
  });

  describe('when the community is private', () => {
    describe('and the user is not logged in', () => {
      it('returns false', async () => {
        const context = {
          params: { communityName: 'foo' },
        };
        await prisma.accounts.create({
          data: {
            name: 'foo',
            slackDomain: 'foo',
            type: AccountType.PRIVATE,
          },
        });
        Session.find.mockResolvedValue(null);
        expect(await PermissionsService.access(context)).toEqual(false);
      });
    });

    describe('and the user is logged in', () => {
      describe('and the user does belong to any community', () => {
        it('returns false', async () => {
          const context = {
            params: { communityName: 'foo' },
          };
          await prisma.accounts.create({
            data: {
              name: 'foo',
              slackDomain: 'foo',
              type: AccountType.PRIVATE,
            },
          });
          Session.find.mockResolvedValue({ user: { email: 'john@doe.com' } });
          expect(await PermissionsService.access(context)).toEqual(false);
        });
      });

      describe('and the user belongs to the community', () => {
        it('returns true', async () => {
          const context = {
            params: { communityName: 'foo' },
          };
          const account = await prisma.accounts.create({
            data: {
              name: 'foo',
              slackDomain: 'foo',
              type: AccountType.PRIVATE,
            },
          });
          await prisma.auths.create({
            data: {
              email: 'john@doe.com',
              accountId: account.id,
              password: 'foo',
              salt: 'bar',
            },
          });
          Session.find.mockResolvedValue({ user: { email: 'john@doe.com' } });
          expect(await PermissionsService.access(context)).toEqual(true);
        });
      });

      describe('and the user belongs to a different community', () => {
        it('returns false', async () => {
          const context = {
            params: { communityName: 'foo' },
          };
          await prisma.accounts.create({
            data: {
              name: 'foo',
              slackDomain: 'foo',
              type: AccountType.PRIVATE,
            },
          });
          const account = await prisma.accounts.create({
            data: {
              name: 'bar',
              type: AccountType.PRIVATE,
            },
          });
          await prisma.auths.create({
            data: {
              email: 'john@doe.com',
              accountId: account.id,
              password: 'foo',
              salt: 'bar',
            },
          });
          Session.find.mockResolvedValue({ user: { email: 'john@doe.com' } });
          expect(await PermissionsService.access(context)).toEqual(false);
        });
      });
    });
  });

  describe('when the community does not exist', () => {
    it('returns false', async () => {
      const context = {
        params: { communityName: 'foo' },
      };
      expect(await PermissionsService.access(context)).toEqual(false);
    });
  });

  describe('when the community name is missing', () => {
    it('returns false', async () => {
      const context = {};
      expect(await PermissionsService.access(context)).toEqual(false);
    });
  });
});

describe('#inbox', () => {
  describe('when the user is logged in', () => {
    describe('and the user belongs to the community', () => {
      it('returns true', async () => {
        const context = {
          params: { communityName: 'foo' },
        };
        const account = await prisma.accounts.create({
          data: {
            name: 'foo',
            slackDomain: 'foo',
          },
        });
        await prisma.auths.create({
          data: {
            email: 'john@doe.com',
            accountId: account.id,
            password: 'foo',
            salt: 'bar',
          },
        });
        Session.find.mockResolvedValue({ user: { email: 'john@doe.com' } });
        expect(await PermissionsService.inbox(context)).toEqual(true);
      });
    });
  });
  describe('when the user is not logged in', () => {
    it('returns false', async () => {
      const context = {
        params: { communityName: 'foo' },
      };
      Session.find.mockResolvedValue(null);
      expect(await PermissionsService.inbox(context)).toEqual(false);
    });
  });
});
