import { Router } from 'express';
import { onError } from 'server/middlewares/error';
import integrationMiddleware from 'server/middlewares/integration';
import validationMiddleware from 'server/middlewares/validation';
import { MessagesController } from 'server/routers/integrations/messages/controller';
import {
  messageFindSchema,
  messageGetSchema,
  messagePostSchema,
  messagePutSchema,
} from '@linen/types';

const prefix = '/api/integrations/messages';

const messagesRouter = Router()
  .get(
    `${prefix}`,
    integrationMiddleware(),
    validationMiddleware(messageFindSchema),
    MessagesController.find
  )
  .get(
    `${prefix}/:id`,
    integrationMiddleware(),
    validationMiddleware(messageGetSchema),
    MessagesController.get
  )
  .post(
    `${prefix}`,
    integrationMiddleware(),
    validationMiddleware(messagePostSchema),
    MessagesController.post
  )
  .put(
    `${prefix}`,
    integrationMiddleware(),
    validationMiddleware(messagePutSchema),
    MessagesController.put
  )
  .all(`${prefix}*`, MessagesController.notImplemented)
  .use(onError);

export default messagesRouter;
