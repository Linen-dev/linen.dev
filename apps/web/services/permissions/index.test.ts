import PermissionsService from '.';
import Session from '../session';

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
        expect(permissions.chat).toEqual(false);
      });
    });
  });
});
