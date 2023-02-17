import { Router } from 'express';
import { onError } from 'server/middlewares/error';
import integrationMiddleware from 'server/middlewares/integration';
import validationMiddleware from 'server/middlewares/validation';
import { UsersController } from 'server/routers/integrations/users/controller';
import { userGetSchema, userPostSchema } from '@linen/types';

const prefix = '/api/integrations/users';

const usersRouter = Router()
  .get(
    `${prefix}`,
    integrationMiddleware(),
    validationMiddleware(userGetSchema),
    UsersController.get
  )
  .post(
    `${prefix}`,
    integrationMiddleware(),
    validationMiddleware(userPostSchema),
    UsersController.post
  )
  .all(`${prefix}*`, UsersController.notImplemented)
  .use(onError);

export default usersRouter;
