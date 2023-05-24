import { v4 } from 'uuid';
import { login } from '__tests__/pages/api/auth/login';
import { create } from '@linen/factory';

export async function createUser(accountId: string, role: string) {
  const creds = { email: v4() + '@linen.dev', password: v4() };
  const auth = await create('auth', { ...creds });
  const user = await create('user', {
    accountsId: accountId,
    authsId: auth.id,
    role,
  });
  const { token } = await (await login({ ...creds })).body;
  return { token, creds, auth, user };
}
