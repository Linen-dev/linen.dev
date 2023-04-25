import { NotImplemented } from 'server/exceptions';
import { NextFunction } from '@linen/types';

export class BaseController {
  static async notImplemented(_: any, _2: any, next: NextFunction) {
    next(new NotImplemented());
  }
}
