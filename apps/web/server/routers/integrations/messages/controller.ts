import { BaseController } from 'server/routers/integrations/base-controller';
import {
  AuthedRequestWithBody,
  NextFunction,
  Response,
  messageFindType,
  messageGetType,
  messagePostType,
  messagePutType,
  messageDeleteType,
} from '@linen/types';
import MessagesService from 'services/messages';
import { HttpException } from 'server/exceptions';

export class MessagesController extends BaseController {
  static async post(
    req: AuthedRequestWithBody<messagePostType>,
    res: Response,
    next: NextFunction
  ) {
    const message = await MessagesService.create({
      ...req.body,
      userId: req.body.authorId,
    });
    res.json(message);
  }
  static async put(
    req: AuthedRequestWithBody<messagePutType>,
    res: Response,
    next: NextFunction
  ) {
    const message = await MessagesService.update({
      ...req.body,
    });
    res.json(message);
  }
  static async find(
    req: AuthedRequestWithBody<messageFindType>,
    res: Response,
    next: NextFunction
  ) {
    const message = await MessagesService.find({
      ...req.body,
    });
    res.json(message);
  }
  static async get(
    req: AuthedRequestWithBody<messageGetType>,
    res: Response,
    next: NextFunction
  ) {
    const message = await MessagesService.getOne({
      ...req.body,
    });
    res.json(message);
  }

  static async delete(
    req: AuthedRequestWithBody<messageDeleteType>,
    res: Response,
    next: NextFunction
  ) {
    const deletionRequest = await MessagesService.delete({
      id: req.body.id,
      accountId: req.body.accountId,
    });
    if (!deletionRequest) {
      return next(new HttpException(500, 'Something went wrong'));
    }
    res.json({ ok: true });
  }
}
