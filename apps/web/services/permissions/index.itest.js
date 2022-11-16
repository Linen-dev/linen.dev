import PermissionsService from '.';
import prisma from 'client';
import Session from '../session';
import { AccountType } from '@prisma/client';
import setup from '__tests__/spec-helpers/integration';

setup({ truncationStrategy: 'delete' });

jest.mock('../session');

describe('#get', () => {
  describe('#manage', () => {
    describe('when the user is not logged in', () => {
      it('returns false', async () => {
        const context = {
          params: { communityName: 'foo' },
        };
        Session.find.mockResolvedValue(null);
        const permissions = await PermissionsService.for(context);
        expect(permissions.manage).toEqual(false);
      });
    });
  });

  describe('#chat', () => {
    describe('when the user is not logged in', () => {
      it('returns false', async () => {
        const context = {
          params: { communityName: 'foo' },
        };
        Session.find.mockResolvedValue(null);
        const permissions = await PermissionsService.for(context);
        expect(permissions.feed).toEqual(false);
      });
    });
  });
});
