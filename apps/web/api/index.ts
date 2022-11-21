import { createRouter, expressWrapper } from 'next-connect';
import cors from 'cors';
import { onNoMatch, onError } from 'api/errors';
import accountsRoutes from 'api/routes/accounts';
import channelsRoutes from 'api/routes/channels';
import threadsRoutes from 'api/routes/threads';
import loginRoutes from 'api/routes/login';
import logoutRoutes from 'api/routes/logout';
import meRoutes from 'api/routes/me';
import tokenRoutes from 'api/routes/token';
import passport from 'api/auth/passport';
import { securityMiddleware } from './middlewares/security';

const routes = createRouter<any, any>()
  .get('/ping', (_, res) => res.end('pong'))
  .use(loginRoutes)
  .use(logoutRoutes)
  .use(threadsRoutes)
  .use(accountsRoutes)
  .use(channelsRoutes)
  .use(meRoutes)
  .use(tokenRoutes);

const baseRoutes = createRouter<any, any>()
  .use(passport.initialize())
  .use(securityMiddleware)
  .use(expressWrapper(cors({})))
  .use('/api/v2', routes);

export default baseRoutes.handler({
  onError,
  onNoMatch,
});
