import { Router } from 'express';
import { onError } from 'server/middlewares/error';
import integrationMiddleware from 'server/middlewares/integration';
import validationMiddleware from 'server/middlewares/validation';
import { MessagesController } from 'server/routers/integrations/messages/controller';
import { messagePostSchema } from '@linen/types';

const prefix = '/api/integrations/messages';

const messagesRouter = Router()
  .post(
    `${prefix}`,
    integrationMiddleware(),
    validationMiddleware(messagePostSchema),
    MessagesController.post
  )
  .all(`${prefix}*`, MessagesController.notImplemented)
  .use(onError);

export default messagesRouter;
