import { AuthedRequestWithTenant } from '@linen/types';
import { Router } from 'express';
import { onError } from 'server/middlewares/error';
import integrationMiddleware from 'server/middlewares/integration';
import { BaseController } from 'server/routers/integrations/base-controller';
import channelsRouter from 'server/routers/integrations/channels';
import messagesRouter from 'server/routers/integrations/messages';
import threadsRouter from 'server/routers/integrations/threads';
import usersRouter from 'server/routers/integrations/users';

const prefix = '/api/integrations';

const integrationsRouter = Router()
  .get(
    `${prefix}/me`,
    integrationMiddleware(),
    async (req: AuthedRequestWithTenant, res) => {
      res.json({ accountId: req.tenant?.id });
    }
  )
  .use(usersRouter)
  .use(threadsRouter)
  .use(channelsRouter)
  .use(messagesRouter)
  .all(`${prefix}*`, BaseController.notImplemented)
  .use(onError);

export default integrationsRouter;
