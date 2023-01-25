import { BaseController } from 'server/routers/integrations/base-controller';
import { AuthedRequestWithBody, NextFunction, Response } from 'server/types';
import { userPostType } from '@linen/types';
import UsersService from 'services/users';

export class UsersController extends BaseController {
  static async post(
    req: AuthedRequestWithBody<userPostType>,
    res: Response,
    next: NextFunction
  ) {
    const user = await UsersService.upsertUser({
      ...req.body,
    });
    res.json(user);
  }
}
