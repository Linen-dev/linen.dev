import handler from '../../../pages/api/accounts';
import { create } from '../../factory';
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../client';

describe('accounts', () => {
  describe('#create', () => {
    it('returns 401 for a not logged in user', async () => {
      const request = create('request', {
        method: 'POST',
      }) as NextApiRequest;
      const response = create('response') as NextApiResponse;
      await handler(request, response);
      expect(response.status).toHaveBeenCalledWith(401);
    });
  });

  describe('#update', () => {
    it('returns a 404 for if the account does not exist', async () => {
      const request = create('request', { method: 'PUT' }) as NextApiRequest;
      const response = create('response') as NextApiResponse;
      await handler(request, response);
      expect(response.status).toHaveBeenCalledWith(404);
    });

    it('updates an account', async () => {
      const account = await prisma.accounts.create({
        data: {
          name: 'super-account',
          private: false,
        },
      });
      const request = create('request', {
        method: 'PUT',
        body: {
          accountId: account.id,
          private: true,
        },
      }) as NextApiRequest;
      const response = create('response') as NextApiResponse;
      await handler(request, response);
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: account.id, private: true })
      );
    });
  });
});
