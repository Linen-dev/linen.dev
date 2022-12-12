import UsersService from 'services/users';
import { getToken, verifyToken } from 'utilities/auth/server/tokens';

type jwtMiddlewareType = {
  ignoreExpiration?: boolean;
};

export const jwtMiddleware = ({
  ignoreExpiration = false,
}: jwtMiddlewareType = {}) => {
  return async (req: any, res: any, next: any) => {
    const token = getToken(req);
    if (!token) {
      return next();
    }

    const session = await verifyToken(token);

    if (!session) {
      return next();
    }

    if (typeof session === 'object') {
      const user = await UsersService.getUserById(session.data.id);
      req.user = user; // req.user = session;
      req.user.exp = session.exp;
    }

    return next();
  };
};

export default jwtMiddleware;
