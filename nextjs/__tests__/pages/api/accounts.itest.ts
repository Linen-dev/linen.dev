import handler from 'pages/api/accounts';
import { create } from '__tests__/factory';
import type { NextApiRequest, NextApiResponse } from 'next';

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
  });
});
