import { Context } from './context';
import { initTRPC, TRPCError } from '@trpc/server';

const t = initTRPC.context<Context>().create({});

export const router = t.router;

export const middleware = t.middleware;

export const mergeRouters = t.mergeRouters;

const isAuthed = middleware(({ next, ctx }) => {
  const user: any = ctx.session?.user;

  if (!user?.id) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({ ctx: { user } });
});

export const publicProcedure = t.procedure;

export const authedProcedure = t.procedure.use(isAuthed);
