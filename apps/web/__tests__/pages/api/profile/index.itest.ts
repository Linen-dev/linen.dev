import * as api from 'pages/api/profile';
import { build, create } from '__tests__/factory';
import setup from '__tests__/spec-helpers/integration';
import { prisma } from '@linen/database';

setup({ truncationStrategy: 'cascade' });

describe('create', () => {
  it('returns 400 if display name param is an empty string', async () => {
    const { status } = await api.update({
      displayName: '',
      authId: '1234',
    });
    expect(status).toEqual(400);
  });

  it('returns 200 when display name is valid', async () => {
    const account = await create('account');
    const auth = await create('auth');
    await create('user', { accountsId: account.id, authsId: auth.id });
    const { status } = await api.update({
      displayName: 'Aron Bem',
      authId: auth.id,
    });
    expect(status).toEqual(200);
    const user = await prisma.users.findFirst({
      where: {
        authsId: auth.id,
      },
    });
    expect(user?.displayName).toEqual('Aron Bem');
  });
});
