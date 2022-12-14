import { createContext } from 'server/context';
import { appRouter } from './_app';

describe('_app', function () {
  test('ping', async () => {
    const ctx = await createContext({ req: {}, res: {} } as any);
    const caller = appRouter.createCaller(ctx);
    const ping = await caller.ping();
    expect(ping).toBe('pong!');
  });

  test('test', async () => {
    const ctx = await createContext({ req: {}, res: {} } as any);
    const caller = appRouter.createCaller(ctx);
    const test = await caller.test({ text: 'test' });
    expect(test).toStrictEqual({ text: 'test' });
  });

  test('test - bad request', async () => {
    const ctx = await createContext({ req: {}, res: {} } as any);
    const caller = appRouter.createCaller(ctx);
    const error = await caller.test({ bad: 'test' } as any).catch((e) => e);
    expect(error.code).toEqual('BAD_REQUEST');
  });
});
