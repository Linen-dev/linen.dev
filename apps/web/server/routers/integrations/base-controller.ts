import { NotImplemented } from 'server/exceptions';
import { NextFunction } from 'server/types';

export class BaseController {
  static async notImplemented(_: any, _2: any, next: NextFunction) {
    next(new NotImplemented());
  }
}
