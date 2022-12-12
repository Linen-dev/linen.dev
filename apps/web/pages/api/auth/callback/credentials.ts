import nextConnect from 'next-connect';
import { onError, onNoMatch } from 'utilities/middlewares/error';
import { init } from 'utilities/middlewares/init';
import { loginPassport } from 'utilities/middlewares/login';
import { signToken } from 'utilities/auth/server/tokens';
import { setSessionCookies } from 'utilities/auth/server/cookies';
import { csrfMiddleware } from 'utilities/middlewares/csrf';

const handler = nextConnect({
  onError,
  onNoMatch,
});

handler.use(init);

handler.post(csrfMiddleware, loginPassport, async (req: any, res) => {
  const token = await signToken(req.user);
  // persist cookies for SSR
  setSessionCookies({ token, req, res });
  // ===
  res.status(200).json({ token });
});

export default handler;
