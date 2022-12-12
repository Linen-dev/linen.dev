import nextConnect from 'next-connect';
import { onError, onNoMatch } from 'utilities/middlewares/error';
import { refreshTokenAction } from 'utilities/auth/server/tokens';
import { csrfMiddleware } from 'utilities/middlewares/csrf';
import jwtMiddleware from 'utilities/middlewares/jwt';

const handler = nextConnect({
  onError,
  onNoMatch,
});

handler.post(jwtMiddleware(), csrfMiddleware, async (req: any, res) => {
  const { newToken } = await refreshTokenAction(req, res);
  res.json({ token: newToken });
});

export default handler;
