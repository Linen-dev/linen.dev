import { Router } from 'express';
import { onError } from 'server/middlewares/error';
import integrationMiddleware from 'server/middlewares/integration';
import validationMiddleware from 'server/middlewares/validation';
import { ChannelsController } from 'server/routers/integrations/channels/controller';
import {
  channelGetIntegrationSchema,
  channelGetSchema,
  channelPutIntegrationSchema,
  channelFindOrCreateSchema,
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
channelsRouter.post(
  `${prefix}`,
  integrationMiddleware(),
  validationMiddleware(channelFindOrCreateSchema),
  ChannelsController.findOrCreate
);

channelsRouter.all(`${prefix}*`, ChannelsController.notImplemented);

channelsRouter.use(onError);

export default channelsRouter;
