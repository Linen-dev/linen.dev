import '__mocks__/tokens';
import { createContext } from 'server/context';
import { v4 } from 'uuid';
import { create } from '__tests__/factory';
import { login } from '__tests__/pages/api/auth/login';
import { appRouter } from './_app';

describe('user', function () {
  let mockAuth: any;
  let token: string;
  let email = v4();
  let password = v4();

  beforeAll(async () => {
    mockAuth = await create('auth', { email, password });
    const { body } = await login({ email, password });
    token = body.token;
  });

  test('receive info 200', async () => {
    const ctx = await createContext({
      req: {
        headers: { authorization: `Bearer ${token}` },
      },
      res: {},
    } as any);
    const caller = appRouter.createCaller(ctx);
    const user = await caller.user.info();
    expect(user).toStrictEqual({ email });
  });

  test('forbidden 401', async () => {
    const ctx = await createContext({ req: {}, res: {} } as any);
    const caller = appRouter.createCaller(ctx);
    const error = await caller.user.info().catch((err) => err);
    expect(error.toString()).toStrictEqual('TRPCError: UNAUTHORIZED');
  });
});
