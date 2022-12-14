import { z } from 'zod';
import { publicProcedure, router } from 'server/trpc';
import { userRouter } from './user';

export const appRouter = router({
  ping: publicProcedure.query(() => 'pong!'),

  test: publicProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(({ input }) => {
      return input;
    }),

  user: userRouter,
});

export type AppRouter = typeof appRouter;
