import { Router } from 'express';
import { onError } from 'server/middlewares/error';
import tenantMiddleware, { Roles } from 'server/middlewares/tenant';
import validationMiddleware from 'server/middlewares/validation';
import { MessagesController } from './controller';
import {
  getMessageSchema,
  postMessageSchema,
  deleteMessageSchema,
  putMessageSchema,
} from '@linen/types';

const prefix = '/api/messages';

const messagesRouter = Router()
  .post(
    `${prefix}`,
    tenantMiddleware([Roles.ADMIN, Roles.MEMBER, Roles.OWNER]),
    validationMiddleware(postMessageSchema),
    MessagesController.post
  )
  .get(
    `${prefix}/:id`,
    tenantMiddleware(),
    validationMiddleware(getMessageSchema),
    MessagesController.get
  )
  .delete(
    `${prefix}/:id`,
    tenantMiddleware([Roles.ADMIN, Roles.MEMBER, Roles.OWNER]),
    validationMiddleware(deleteMessageSchema),
    MessagesController.delete
  )
  .put(
    `${prefix}/:id`,
    tenantMiddleware([Roles.ADMIN, Roles.MEMBER, Roles.OWNER]),
    validationMiddleware(putMessageSchema),
    MessagesController.put
  )
  .all(`${prefix}*`, MessagesController.notImplemented)
  .use(onError);

export default messagesRouter;
