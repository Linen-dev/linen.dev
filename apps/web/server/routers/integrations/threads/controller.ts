import { BaseController } from 'server/routers/integrations/base-controller';
import {
  AuthedRequestWithBody,
  NextFunction,
  Response,
  threadPostType,
  threadFindType,
  threadPutType,
} from '@linen/types';
import ThreadsServices from 'services/threads';
import { NotFound } from 'server/exceptions';

export class ThreadsController extends BaseController {
  static async find(
    req: AuthedRequestWithBody<threadFindType>,
    res: Response,
    next: NextFunction
  ) {
    const thread = await ThreadsServices.findBy({
      ...req.body,
    });
    res.json(thread);
  }

  static async post(
    req: AuthedRequestWithBody<threadPostType>,
    res: Response,
    next: NextFunction
  ) {
    const thread = await ThreadsServices.create({
      ...req.body,
    });
    res.json(thread);
  }

  static async put(
    req: AuthedRequestWithBody<threadPutType>,
    res: Response,
    next: NextFunction
  ) {
    const thread = await ThreadsServices.findBy({
      ...req.body,
    });
    if (!thread) {
      return next(new NotFound());
    }
    await ThreadsServices.update({
      id: thread.id,
      accountId: req.body.accountId,
      externalThreadId: req.body.externalThreadId,
      state: req.body.status,
    });
    res.json(thread);
  }
}
