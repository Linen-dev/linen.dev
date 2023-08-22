import * as api from 'pages/api/signin';
import { createAuth } from '@linen/factory';
import { v4 } from 'uuid';

describe('#create', () => {
  it('returns 200 when email and password match', async () => {
    const auth = await createAuth({ email: v4(), password: 'loremipsum1!' });
    const { status } = await api.create({
      email: auth.email,
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
    const auth = await createAuth({ email: v4(), password: 'loremipsum1!' });
    const { status } = await api.create({
      email: auth.email,
      password: '1234',
    });
    expect(status).toEqual(401);
  });
});
