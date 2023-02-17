import { Router } from 'express';
import { onError } from 'server/middlewares/error';
import integrationMiddleware from 'server/middlewares/integration';
import validationMiddleware from 'server/middlewares/validation';
import { ChannelsController } from 'server/routers/integrations/channels/controller';
import {
  channelGetIntegrationSchema,
  channelGetSchema,
  channelPutIntegrationSchema,
} from '@linen/types';

const prefix = '/api/integrations/channels';

const channelsRouter = Router();

channelsRouter.get(
  `${prefix}`,
  integrationMiddleware(),
  validationMiddleware(channelGetSchema),
  ChannelsController.get
);
channelsRouter.get(
  `${prefix}/integration`,
  integrationMiddleware(),
  validationMiddleware(channelGetIntegrationSchema),
  ChannelsController.getIntegration
);
channelsRouter.put(
  `${prefix}/integration`,
  integrationMiddleware(),
  validationMiddleware(channelPutIntegrationSchema),
  ChannelsController.putIntegration
);

channelsRouter.all(`${prefix}*`, ChannelsController.notImplemented);

channelsRouter.use(onError);

export default channelsRouter;
