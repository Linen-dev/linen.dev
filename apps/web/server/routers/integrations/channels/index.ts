import { Router } from 'express';
import { onError } from 'server/middlewares/error';
import integrationMiddleware from 'server/middlewares/integration';
import validationMiddleware from 'server/middlewares/validation';
import { ChannelsController } from 'server/routers/integrations/channels/controller';
import { channelGetSchema } from '@linen/types';

const prefix = '/api/integrations/channels';

const channelsRouter = Router();

channelsRouter.get(
  `${prefix}`,
  integrationMiddleware(),
  validationMiddleware(channelGetSchema),
  ChannelsController.get
);

channelsRouter.all(`${prefix}*`, ChannelsController.notImplemented);

channelsRouter.use(onError);

export default channelsRouter;
