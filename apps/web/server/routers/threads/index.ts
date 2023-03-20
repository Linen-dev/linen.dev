import { Router } from 'express';
import { onError } from 'server/middlewares/error';
import tenantMiddleware, { Roles } from 'server/middlewares/tenant';
import validationMiddleware from 'server/middlewares/validation';
import { ThreadsController } from './controller';
import { findSchema, getSchema, postSchema, putSchema } from './types';

const prefix = '/api/threads';

const threadsRouter = Router()
  .get(
    `${prefix}`,
    tenantMiddleware(),
    validationMiddleware(findSchema),
    ThreadsController.find
  )
  .post(
    `${prefix}`,
    tenantMiddleware([Roles.ADMIN, Roles.MEMBER, Roles.OWNER]),
    validationMiddleware(postSchema),
    ThreadsController.post
  )
  .get(
    `${prefix}/:id`,
    tenantMiddleware(),
    validationMiddleware(getSchema),
    ThreadsController.get
  )
  .put(
    `${prefix}/:id`,
    tenantMiddleware([Roles.ADMIN, Roles.MEMBER, Roles.OWNER]),
    validationMiddleware(putSchema),
    ThreadsController.put
  )
  .all(`${prefix}*`, ThreadsController.notImplemented)
  .use(onError);

export default threadsRouter;
