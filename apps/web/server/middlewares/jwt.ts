import { AuthedRequest, Response, NextFunction } from 'server/types';
import UsersService from 'services/users';
import { getToken, verifyToken } from 'utilities/auth/server/tokens';
import { Unauthorized } from 'server/exceptions';

export default function jwtMiddleware(_?: never) {
  return async (req: AuthedRequest, _: any, next: NextFunction) => {
    const token = getToken(req);
    if (!token) {
      return next(new Unauthorized());
    }

    const session = await verifyToken(token);

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
