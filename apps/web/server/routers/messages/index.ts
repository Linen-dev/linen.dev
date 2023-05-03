import { Router } from 'express';
import { onError } from 'server/middlewares/error';
import tenantMiddleware, { Roles } from 'server/middlewares/tenant';
import validationMiddleware from 'server/middlewares/validation';
import { MessagesController } from './controller';
import { getSchema, postSchema, deleteSchema, putSchema } from './types';

const prefix = '/api/messages';

const messagesRouter = Router()
  .post(
    `${prefix}`,
    tenantMiddleware([Roles.ADMIN, Roles.MEMBER, Roles.OWNER]),
    validationMiddleware(postSchema),
    MessagesController.post
  )
  .get(
    `${prefix}/:id`,
    tenantMiddleware(),
    validationMiddleware(getSchema),
    MessagesController.get
  )
  .delete(
    `${prefix}/:id`,
    tenantMiddleware([Roles.ADMIN, Roles.MEMBER, Roles.OWNER]),
    validationMiddleware(deleteSchema),
    MessagesController.delete
  )
  .put(
    `${prefix}/:id`,
    tenantMiddleware([Roles.ADMIN, Roles.MEMBER, Roles.OWNER]),
    validationMiddleware(putSchema),
    MessagesController.put
  )
  .all(`${prefix}*`, MessagesController.notImplemented)
  .use(onError);

export default messagesRouter;
