import { Router } from 'express';
import { onError } from 'server/middlewares/error';
import { BaseController } from 'server/routers/integrations/base-controller';
import channelsRouter from 'server/routers/integrations/channels';
import messagesRouter from 'server/routers/integrations/messages';
import threadsRouter from 'server/routers/integrations/threads';
import usersRouter from 'server/routers/integrations/users';

const prefix = '/api/integrations';

const integrationsRouter = Router()
  .use(usersRouter)
  .use(threadsRouter)
  .use(channelsRouter)
  .use(messagesRouter)
  .all(`${prefix}*`, BaseController.notImplemented)
  .use(onError);

export default integrationsRouter;
