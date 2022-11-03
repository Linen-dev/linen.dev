import { prismaMock } from '__tests__/singleton';
import { create, update } from 'pages/api/accounts';
import { Session } from 'next-auth';
import { build } from '__tests__/factory';

describe('accounts', () => {
  describe('#create', () => {
    describe('when the user is logged in', () => {
      describe('and the account was created successfully', () => {
        it('returns a 200 and the account id', async () => {
          const session = { user: { email: 'john@doe.com' } } as Session;
          await prismaMock.accounts.create.mockResolvedValue(
            build('account', { id: 'account-id' })
          );
          const { status, data } = await create({
            session,
          });
          expect(status).toEqual(200);
          expect(data).toEqual({ id: 'account-id' });
        });
      });

      describe('and the account creation failed', () => {
        it('returns a 500', async () => {
          const session = { user: { email: 'john@doe.com' } } as Session;
          await prismaMock.accounts.create.mockRejectedValue({});
          const { status } = await create({
            session,
          });
          expect(status).toEqual(500);
        });
      });
    });

    describe('when the user is not logged in', () => {
      it('returns 401', async () => {
        const { status } = await create({
          session: null,
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
            const session = { user: { email: 'john@doe.com' } } as Session;
            const account = build('account', {
              id: 'account-id',
              premium: false,
            });
            const auth = build('auth', { accountId: account.id });
            await prismaMock.auths.findFirst.mockResolvedValue(auth);
            await prismaMock.accounts.findFirst.mockResolvedValue(account);
            await prismaMock.accounts.update.mockResolvedValue(account);
            const { status } = await update({
              params: { homeUrl: 'https://foo.com', type: 'PRIVATE' },
              session,
            });
            expect(status).toEqual(200);
            expect(prismaMock.accounts.update).toHaveBeenCalledWith(
              expect.objectContaining({
                data: { homeUrl: 'https://foo.com' },
              })
            );
          });
        });

        describe('and the account is premium', () => {
          it('returns a 200', async () => {
            const session = { user: { email: 'john@doe.com' } } as Session;
            const account = build('account', {
              id: 'account-id',
              premium: true,
            });
            const auth = build('auth', { accountId: account.id });
            await prismaMock.auths.findFirst.mockResolvedValue(auth);
            await prismaMock.accounts.findFirst.mockResolvedValue(account);
            await prismaMock.accounts.update.mockResolvedValue(account);
            const { status } = await update({
              params: { homeUrl: 'https://foo.com', type: 'PRIVATE' },
              session,
            });
            expect(status).toEqual(200);
            expect(prismaMock.accounts.update).toHaveBeenCalledWith(
              expect.objectContaining({
                data: { homeUrl: 'https://foo.com', type: 'PRIVATE' },
              })
            );
          });
        });
      });
      describe('and the account does not exist', () => {
        it('returns a 404', async () => {
          const session = { user: { email: 'john@doe.com' } } as Session;
          const { status } = await update({
            params: {},
            session,
          });
          expect(status).toEqual(404);
        });
      });
    });

    describe('when the user is not logged in', () => {
      it('returns 401', async () => {
        const { status } = await update({
          params: {},
          session: null,
        });
        expect(status).toEqual(401);
      });
    });
  });
});
