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
  messageDeleteSchema,
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
    `${prefix}/:messageId`,
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
  .delete(
    `${prefix}`,
    integrationMiddleware(),
    validationMiddleware(messageDeleteSchema),
    MessagesController.delete
  )
  .all(`${prefix}*`, MessagesController.notImplemented)
  .use(onError);

export default messagesRouter;
