import * as api from 'pages/api/signin';
import { create } from '@linen/factory';
import setup from '__tests__/spec-helpers/integration';

setup({ truncationStrategy: 'delete' });

describe('#create', () => {
  it('returns 200 when email and password match', async () => {
    await create('auth', { email: 'john@doe.com', password: 'loremipsum1!' });
    const { status } = await api.create({
      email: 'john@doe.com',
      password: 'loremipsum1!',
    });
    expect(status).toEqual(200);
  });

  it('returns 400 when email is missing', async () => {
    const { status } = await api.create({
      email: '',
      password: '1234',
    });
    expect(status).toEqual(400);
  });

  it('returns 400 when password is missing', async () => {
    const { status } = await api.create({
      email: '',
      password: '1234',
    });
    expect(status).toEqual(400);
  });

  it('returns 401 when there is no such user', async () => {
    const { status } = await api.create({
      email: 'john@doe.com',
      password: '1234',
    });
    expect(status).toEqual(401);
  });

  it('returns 401 when the password does not match', async () => {
    await create('auth', { email: 'john@doe.com', password: 'loremipsum1!' });
    const { status } = await api.create({
      email: 'john@doe.com',
      password: '1234',
    });
    expect(status).toEqual(401);
  });
});
