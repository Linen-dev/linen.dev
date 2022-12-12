import nextConnect from 'next-connect';
import { onError, onNoMatch } from 'utilities/middlewares/error';
import { createCSRFToken } from 'utilities/auth/server/csrf';

const handler = nextConnect({
  onError,
  onNoMatch,
});

handler.get((req, res) => {
  const csrfToken = createCSRFToken();
  res.json({ csrfToken });
});

export default handler;
