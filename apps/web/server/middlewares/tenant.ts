import { z } from 'zod';
import { getAccountById } from 'lib/models';
import { Forbidden, NotFound, Unauthorized } from 'server/exceptions';
import jwtMiddleware from 'server/middlewares/jwt';
import { AuthedRequestWithTenant, NextFunction, Response } from 'server/types';
import { identifyUserSession, Sentry } from 'utilities/ssr-metrics';

// improvement: be able to use typed Roles from prisma
export const Roles = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
};

const schema = z.object({
  accountId: z.string().uuid(),
});

export default function tenantMiddleware(roles?: string[]) {
  return async (
    req: AuthedRequestWithTenant,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { accountId } = schema.parse({
        ...req.body,
        ...req.query,
        ...req.params,
      });
      // assign the tenant in the req object for easy access later
      req.tenant = await getAccountById(accountId); // improvement: cache the findAccountByPath function
      if (!req.tenant) {
        return next(new NotFound());
      }

      if (!req.session_user) {
        // if session is not identify yet
        await new Promise((resolve, _) => jwtMiddleware()(req, null, resolve));
      }

      if (req.tenant.type === 'PRIVATE') {
        // if account is private user must be logged
        if (!req.session_user) {
          return next(new Unauthorized());
        }
        req.tenant_user = req.session_user?.users?.find(
          (u) => u.accountsId === req.tenant?.id!
        );
        // and the user must have at least a role in the tenant
        if (!req.tenant_user) {
          return next(new Forbidden());
        }
      }

      if (roles && roles.length) {
        if (!req.session_user) {
          return next(new Unauthorized());
        }
        req.tenant_user = req.session_user?.users?.find(
          (u) => u.accountsId === req.tenant?.id!
        );
        // session must have a tenant_user
        if (!req.tenant_user) {
          return next(new Forbidden());
        }

        const hasRole = roles.find((role) => req.tenant_user?.role === role);
        // role must match
        if (!hasRole) {
          return next(new Forbidden());
        }
      }

      Sentry.setUser({
        id: req.session_user
          ? req.session_user.id
          : identifyUserSession({ req, res }),
      });

      return next();
    } catch (error) {
      return next(error);
    }
  };
}
