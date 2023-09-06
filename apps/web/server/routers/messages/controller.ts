import {
  AuthedRequestWithTenantAndBody,
  NextFunction,
  Response,
  ChatType,
  getMessageType,
  postMessageType,
  deleteMessageType,
  putMessageType,
} from '@linen/types';
import {
  BadRequest,
  Forbidden,
  NotFound,
  NotImplemented,
} from 'server/exceptions';
import { Roles } from 'server/middlewares/tenant';
import MessagesService from 'services/messages';
import { isNotManager } from 'utilities/roles';
import { ApiEvent, trackApiEvent } from 'utilities/ssr-metrics';

export class MessagesController {
  static async get(
    req: AuthedRequestWithTenantAndBody<getMessageType>,
    res: Response,
    next: NextFunction
  ) {
    const message = await MessagesService.get({
      ...req.body,
      accountId: req.tenant?.id!,
    });
    if (!message) {
      return next(new NotFound());
    }
    res.json(message);
  }

  static async delete(
    req: AuthedRequestWithTenantAndBody<deleteMessageType>,
    res: Response,
    next: NextFunction
  ) {
    // if is not manager, must be the author
    if (isNotManager(req.tenant_user?.role)) {
      const message = await MessagesService.get({
        id: req.body.id,
        accountId: req.tenant?.id!,
      });
      if (!message || !message.author?.id) {
        return next(new NotFound());
      }
      if (req.tenant_user?.id! !== message.author.id) {
        return next(new Forbidden('User not allow to delete this message'));
      }
    }

    const message = await MessagesService.delete({
      id: req.body.id,
      accountId: req.tenant?.id!,
    });
    if (!message) {
      return next(new NotFound());
    }

    res.json(message);
  }

  static async post(
    req: AuthedRequestWithTenantAndBody<postMessageType>,
    res: Response,
    next: NextFunction
  ) {
    if (req.tenant?.chat === ChatType.NONE) {
      return next(new Forbidden('Community has chat disabled'));
    }

    if (
      req.tenant?.chat === ChatType.MANAGERS &&
      isNotManager(req.tenant_user?.role)
    ) {
      return next(new Forbidden('User is not allow to chat'));
    }

    const message = await MessagesService.create({
      ...req.body,
      userId: req.tenant_user?.id!,
    });

    await trackApiEvent({ req, res }, ApiEvent.user_send_message);

    res.json(message);
  }

  static async put(
    req: AuthedRequestWithTenantAndBody<putMessageType>,
    res: Response,
    next: NextFunction
  ) {
    const message = await MessagesService.get({
      id: req.body.id,
      accountId: req.tenant?.id!,
    });

    const ownerId = req.tenant_user?.id;
    const authorId = message?.author?.id;

    if (!ownerId || !authorId || ownerId !== authorId) {
      return next(new Forbidden('User is not allowed to update this message'));
    }

    const updated = await MessagesService.update({
      messageId: req.body.id,
      body: req.body.body,
    });
    return res.json(updated);
  }

  static async notImplemented(_: any, _2: any, next: NextFunction) {
    next(new NotImplemented());
  }
}
