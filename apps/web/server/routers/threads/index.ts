import { Router } from 'express';
import { Forbidden, NotFound, NotImplemented } from 'server/exceptions';
import { onError } from 'server/middlewares/error';
import tenantMiddleware, { Roles } from 'server/middlewares/tenant';
import validationMiddleware from 'server/middlewares/validation';
import {
  AuthedRequestWithTenantAndBody,
  NextFunction,
  Response,
} from 'server/types';
import ThreadsServices from 'services/threads';
import {
  findSchema,
  findType,
  getSchema,
  getType,
  putSchema,
  putType,
} from './types';

class ThreadsController {
  static async get(
    req: AuthedRequestWithTenantAndBody<getType>,
    res: Response,
    next: NextFunction
  ) {
    const thread = await ThreadsServices.get({ ...req.body });
    if (!thread) {
      return next(new NotFound());
    }
    res.json(thread);
  }
  static async find(
    req: AuthedRequestWithTenantAndBody<findType>,
    res: Response,
    _: NextFunction
  ) {
    const threads = await ThreadsServices.find({ ...req.body });
    res.json(threads);
  }
  static async put(
    req: AuthedRequestWithTenantAndBody<putType>,
    res: Response,
    next: NextFunction
  ) {
    // if pinned, must be admin/owner
    if (typeof req.body.pinned === 'boolean') {
      if (
        req.tenant_user?.role !== Roles.OWNER ||
        req.tenant_user?.role !== Roles.ADMIN
      ) {
        return next(new Forbidden('User not allow to pin messages'));
      }
    }

    // if member, must be the creator
    if (req.tenant_user?.role === Roles.MEMBER) {
      const thread = await ThreadsServices.get({
        id: req.body.id,
      });
      if (req.tenant_user.id !== thread?.messages?.shift()?.author?.id) {
        return next(new Forbidden('User not allow to update this message'));
      }
    }

    const thread = await ThreadsServices.update({ ...req.body });
    res.json(thread);
  }

  static async notImplemented(_: any, _2: any, next: NextFunction) {
    next(new NotImplemented());
  }
}
const prefix = '/api/threads';

const threadsRouter = Router()
  .get(
    `${prefix}`,
    tenantMiddleware(),
    validationMiddleware(findSchema),
    ThreadsController.find
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
