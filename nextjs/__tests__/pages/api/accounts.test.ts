import { create, update } from 'pages/api/accounts';

describe('accounts', () => {
  describe('#create', () => {
    it('returns 401 for a not logged in user', async () => {
      const { status } = await create({ session: null });
      expect(status).toEqual(401);
    });
  });

  describe('#update', () => {
    it('returns a 404 for if the account does not exist', async () => {
      const { status } = await update({ params: { accountId: '1234' } });
      expect(status).toEqual(404);
    });
  });
});
