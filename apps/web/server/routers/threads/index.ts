import { Router } from 'express';
import { onError } from 'server/middlewares/error';
import tenantMiddleware, { Roles } from 'server/middlewares/tenant';
import validationMiddleware from 'server/middlewares/validation';
import { ThreadsController } from './controller';
import {
  findThreadSchema,
  createThreadSchema,
  getThreadSchema,
  updateThreadSchema,
} from '@linen/types';

const prefix = '/api/threads';

const threadsRouter = Router()
  .get(
    `${prefix}`,
    tenantMiddleware(),
    validationMiddleware(findThreadSchema),
    ThreadsController.find
  )
  .post(
    `${prefix}`,
    tenantMiddleware([Roles.ADMIN, Roles.MEMBER, Roles.OWNER]),
    validationMiddleware(createThreadSchema),
    ThreadsController.post
  )
  .get(
    `${prefix}/:id`,
    tenantMiddleware(),
    validationMiddleware(getThreadSchema),
    ThreadsController.get
  )
  .put(
    `${prefix}/:id`,
    tenantMiddleware([Roles.ADMIN, Roles.MEMBER, Roles.OWNER]),
    validationMiddleware(updateThreadSchema),
    ThreadsController.put
  )
  .all(`${prefix}*`, ThreadsController.notImplemented)
  .use(onError);

export default threadsRouter;
