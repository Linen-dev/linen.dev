import { Router } from 'express';
import { onError } from 'server/middlewares/error';
import integrationMiddleware from 'server/middlewares/integration';
import validationMiddleware from 'server/middlewares/validation';
import { ChannelsController } from 'server/routers/integrations/channels/controller';
import { channelGetSchema } from '@linen/types';

const prefix = '/api/integrations/channels';

const channelsRouter = Router()
  .get(
    `${prefix}`,
    integrationMiddleware(),
    validationMiddleware(channelGetSchema),
    ChannelsController.get
  )
  .all(`${prefix}*`, ChannelsController.notImplemented)
  .use(onError);

export default channelsRouter;
