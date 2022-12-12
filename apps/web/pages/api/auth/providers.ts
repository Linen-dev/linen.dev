import nextConnect from 'next-connect';
import init from 'utilities/middlewares/init';
import { onError, onNoMatch } from 'utilities/middlewares/error';

const handler = nextConnect({
  onError,
  onNoMatch,
});

handler.use(init);

handler.get(async (req, res) => {
  res.status(200).json({
    // email: { type: 'email' },
    credentials: { type: 'credentials' },
  });
});

export default handler;
