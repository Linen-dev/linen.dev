import nextConnect from 'next-connect';
import { init } from 'utilities/middlewares/init';
import { onError, onNoMatch } from 'utilities/middlewares/error';
import { expireSessionCookies } from 'utilities/auth/server/cookies';

const handler = nextConnect({
  onError,
  onNoMatch,
});

handler.use(init);

handler.post(async (req: any, res, next) => {
  try {
    expireSessionCookies({ req, res });
    res.status(200).json({});
  } catch (error) {
    next(error);
  }
});

export default handler;
