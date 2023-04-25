import { AuthedRequest, Response, NextFunction } from '@linen/types';
import UsersService from 'services/users';
import {
  getToken,
  verifyToken,
  expireSessionCookies,
} from '@linen/auth/server';
import { Unauthorized } from 'server/exceptions';
import to from '@linen/utilities/await-to-js';

export default function jwtMiddleware(_?: never) {
  return async (req: AuthedRequest, res: any, next: NextFunction) => {
    const token = getToken(req);
    if (!token) {
      return next(new Unauthorized());
    }

    const [err, session] = await to(verifyToken(token));

    if (err) {
      expireSessionCookies({ req, res });
      return next(new Unauthorized());
    }

    if (!session) {
      return next(new Unauthorized());
    }

    if (typeof session === 'object') {
      const user = await UsersService.getUserById(session.data.id);
      if (!user) {
        return next(new Unauthorized());
      }
      req.session_user = { ...user, exp: session.exp };
    }

    return next();
  };
}
