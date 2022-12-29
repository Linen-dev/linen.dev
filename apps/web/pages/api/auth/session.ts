import nextConnect from 'next-connect';
import init from 'utilities/middlewares/init';
import { onError, onNoMatch } from 'utilities/middlewares/error';
import jwtMiddleware from 'utilities/middlewares/jwt';
import type { SessionType } from 'services/session';
import { refreshTokenAction } from 'utilities/auth/server/tokens';
import { expireSessionCookies } from 'utilities/auth/server/cookies';

export const onJwtExpiredError = (
  error: any,
  req: any,
  res: any,
  next: any
) => {
  try {
    if (error.message === 'jwt expired') {
      expireSessionCookies({ req, res });
    }
  } catch (error) {}
  return onError(error, req, res, next);
};

const handler = nextConnect({
  onError: onJwtExpiredError,
  onNoMatch,
});

handler.use(init);

handler.get(jwtMiddleware(), async (req: any, res) => {
  await refreshTokenAction(req, res);

  const user = req.user?.users.find((e: any) => e);
  res.status(200).json({
    user: {
      email: req.user.email,
      id: req.user.id,
      name: user?.displayName,
      image: user?.profileImageUrl,
    },
    ...(req.user?.exp && {
      expires: new Date(req.user?.exp * 1000).toISOString(),
    }),
  } as SessionType);
});

export default handler;
