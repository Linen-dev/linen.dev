import nextConnect from 'next-connect';
import init from 'utilities/middlewares/init';
import { onError, onNoMatch } from 'utilities/middlewares/error';
import { magicLinkStrategy } from 'utilities/auth/passport';
import { csrfMiddleware } from 'utilities/middlewares/csrf';

export default nextConnect({
  onError,
  onNoMatch,
})
  .use(init)
  .post(csrfMiddleware, magicLinkStrategy.send as any);
