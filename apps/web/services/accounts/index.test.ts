import accountsService from '.';
import { accounts, auths } from '@linen/database';
import { create } from '@linen/factory';
import { v4 } from 'uuid';
import { z } from 'zod';

describe('accounts', () => {
  describe('#create', () => {
    describe('when the user is logged in', () => {
      describe('and the account was created successfully', () => {
        it('returns a 200 and the account id', async () => {
          const auth: auths = await create('auth', { email: v4() });
          const { status, ...data } = await accountsService.create({
            email: auth.email,
          });
          expect(status).toEqual(200);
          expect(z.string().uuid().safeParse(data.id).success).toBe(true);
        });
      });

      describe('and the account creation failed', () => {
        it('returns a 500', async () => {
          const { status } = await accountsService.create({
            email: v4(),
          });
          expect(status).toEqual(500);
        });
      });
    });

    describe('when the user is not logged in', () => {
      it('returns 401', async () => {
        const { status } = await accountsService.create({
          email: null,
        });
        expect(status).toEqual(401);
      });
    });
  });

  describe('#update', () => {
    describe('when the user is logged in', () => {
      describe('and the account exists', () => {
        describe('and the account is free', () => {
          it('returns a 200', async () => {
            const account: accounts = await create('account', {
              premium: false,
            });

            const { status, record } = await accountsService.update({
              params: { homeUrl: 'https://foo.com', type: 'PRIVATE' },
              accountId: account.id,
            });
            expect(status).toEqual(200);
            expect(record).toMatchObject({ homeUrl: 'https://foo.com' });
          });
        });

        describe('and the account is premium', () => {
          it('returns a 200', async () => {
            const account: accounts = await create('account', {
              premium: true,
            });

            const { status, record } = await accountsService.update({
              params: { homeUrl: 'https://foo.com', type: 'PRIVATE' },
              accountId: account.id,
            });
            expect(status).toEqual(200);
            expect(record).toMatchObject({
              homeUrl: 'https://foo.com',
              type: 'PRIVATE',
            });
          });
        });
      });
      describe('and the account does not exist', () => {
        it('returns a 404', async () => {
          const { status } = await accountsService.update({
            params: {},
            accountId: 'not-exist',
          });
          expect(status).toEqual(404);
        });
      });
    });
  });
});
