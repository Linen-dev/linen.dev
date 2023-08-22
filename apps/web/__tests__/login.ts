import { v4 } from 'uuid';
import { login } from '__tests__/pages/api/auth/login';
import { createUser as factoryCreateUser, createAuth } from '@linen/factory';

export async function createUser(
  accountId: string,
  role: 'ADMIN' | 'MEMBER' | 'OWNER'
) {
  const creds = { email: v4() + '@linen.dev', password: v4() };
  const auth = await createAuth({ ...creds });
  const user = await factoryCreateUser({
    accountsId: accountId,
    authsId: auth.id,
    role,
  });
  const { token } = await (await login({ ...creds })).body;
  return { token, creds, auth, user };
}
