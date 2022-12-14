import * as trpc from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';
import { getServerSession } from 'utilities/auth/server/session';

export const createContext = async (
  opts: trpcNext.CreateNextContextOptions
) => {
  const session = await getServerSession(opts.req, opts.res);
  return {
    session,
  };
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
