import { Router } from 'express';
import { onError } from 'server/middlewares/error';
import integrationMiddleware from 'server/middlewares/integration';
import validationMiddleware from 'server/middlewares/validation';
import { ThreadsController } from 'server/routers/integrations/threads/controller';
import {
  threadPostSchema,
  threadFindSchema,
  threadPutSchema,
} from '@linen/types';

const prefix = '/api/integrations/threads';

const threadsRouter = Router()
  .get(
    `${prefix}`,
    integrationMiddleware(),
    validationMiddleware(threadFindSchema),
    ThreadsController.find
  )
  .post(
    `${prefix}`,
    integrationMiddleware(),
    validationMiddleware(threadPostSchema),
    ThreadsController.post
  )
  .put(
    `${prefix}`,
    integrationMiddleware(),
    validationMiddleware(threadPutSchema),
    ThreadsController.put
  )
  .all(`${prefix}*`, ThreadsController.notImplemented)
  .use(onError);

export default threadsRouter;
