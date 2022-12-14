import { authedProcedure, router } from 'server/trpc';

export const userRouter = router({
  info: authedProcedure.query(async ({ ctx }) => {
    const email = ctx.user.email as string;
    return {
      email,
    };
  }),
});
