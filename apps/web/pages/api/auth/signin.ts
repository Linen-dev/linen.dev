import nextConnect from 'next-connect';
import init from 'utilities/middlewares/init';
import { onError, onNoMatch } from 'utilities/middlewares/error';

const handler = nextConnect({
  onError,
  onNoMatch,
});

handler.use(init);

// useful for the sign in flow
handler.get(async (req, res) => {
  const callbackUrl = req.query.callbackUrl;

  const query =
    callbackUrl && typeof callbackUrl === 'string'
      ? new URLSearchParams({ callbackUrl })
      : '';

  res.redirect('/signin?' + query);
});

export default handler;
