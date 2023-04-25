import { BaseController } from 'server/routers/integrations/base-controller';
import {
  AuthedRequestWithBody,
  NextFunction,
  Response,
  userGetType,
  userPostType,
} from '@linen/types';
import UsersService from 'services/users';
import { NotFound } from 'server/exceptions';

export class UsersController extends BaseController {
  static async post(
    req: AuthedRequestWithBody<userPostType>,
    res: Response,
    next: NextFunction
  ) {
    const user = await UsersService.upsertUser({
      ...req.body,
    });
    return res.json(user);
  }

  static async get(
    req: AuthedRequestWithBody<userGetType>,
    res: Response,
    next: NextFunction
  ) {
    const users = await UsersService.findUsersByExternalId({
      accountId: req.body.accountsId,
      externalIds: [req.body.externalUserId],
    });
    if (users && users.length) {
      return res.json({ id: users?.shift()?.id });
    } else {
      return next(new NotFound());
    }
  }
}
