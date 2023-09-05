import { Router } from 'express';
import { onError } from 'server/middlewares/error';
import tenantMiddleware, { Roles } from 'server/middlewares/tenant';
import validationMiddleware from 'server/middlewares/validation';
import { ThreadsController } from './controller';
import {
  findThreadSchema,
  findTopicsSchema,
  getThreadSchema,
  postThreadSchema,
  putThreadSchema,
} from '@linen/types';

const prefix = '/api/threads';

const threadsRouter = Router()
  .get(
    `${prefix}`,
    tenantMiddleware(),
    validationMiddleware(findThreadSchema),
    ThreadsController.find
  )
  .get(
    `${prefix}/topics`,
    tenantMiddleware(),
    validationMiddleware(findTopicsSchema),
    ThreadsController.findTopics
  )
  .post(
    `${prefix}`,
    tenantMiddleware([Roles.ADMIN, Roles.MEMBER, Roles.OWNER]),
    validationMiddleware(postThreadSchema),
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
    validationMiddleware(putThreadSchema),
    ThreadsController.put
  )
  .all(`${prefix}*`, ThreadsController.notImplemented)
  .use(onError);

export default threadsRouter;
