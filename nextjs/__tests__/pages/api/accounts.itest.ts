import { create, update } from 'pages/api/accounts';
import { create as factory } from '__tests__/factory';
import type { NextApiRequest, NextApiResponse } from 'next';

describe('accounts', () => {
  describe('#create', () => {
    it('returns 401 for a not logged in user', async () => {
      const request = factory('request', {
        method: 'POST',
      }) as NextApiRequest;
      const response = factory('response') as NextApiResponse;
      await create(request, response);
      expect(response.status).toHaveBeenCalledWith(401);
    });
  });

  describe('#update', () => {
    it('returns a 404 for if the account does not exist', async () => {
      const request = factory('request', { method: 'PUT' }) as NextApiRequest;
      const response = factory('response') as NextApiResponse;
      await update(request, response);
      expect(response.status).toHaveBeenCalledWith(404);
    });
  });
});
