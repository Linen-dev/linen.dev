import { BaseController } from 'server/routers/integrations/base-controller';
import { AuthedRequestWithBody, NextFunction, Response } from 'server/types';
import { messagePostType } from '@linen/types';
import MessagesService from 'services/messages';

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
}
