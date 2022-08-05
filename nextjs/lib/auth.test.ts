import { verifyAuthByToken } from './auth';
import prisma from '../client';

jest.mock('../client');

describe('#verifyAuthByToken', () => {
  describe('when token does not exist', () => {
    it('returns false', async () => {
      const verified = await verifyAuthByToken();
      expect(verified).toEqual(false);
    });
  });

  describe('when token is an array of strings', () => {
    it('returns false', async () => {
      const verified = await verifyAuthByToken(['token1', 'token2']);
      expect(verified).toEqual(false);
    });
  });

  describe('when token exists', () => {
    it('returns true', async () => {
      (prisma.auths.findFirst as jest.Mock).mockResolvedValue({
        id: '1234',
      });
      const verified = await verifyAuthByToken('token');
      expect(verified).toEqual(true);
    });

    it('updates the auth', async () => {
      (prisma.auths.findFirst as jest.Mock).mockResolvedValue({
        id: '1234',
      });
      const verified = await verifyAuthByToken('token');
      expect(prisma.auths.update).toHaveBeenCalledWith({
        where: { id: '1234' },
        data: { verified: true, verificationToken: null },
      });
    });

    describe('when auth is not found', () => {
      it('returns false', async () => {
        (prisma.auths.findFirst as jest.Mock).mockResolvedValue(null);
        const verified = await verifyAuthByToken('token');
        expect(verified).toEqual(false);
      });
    });
  });
});
