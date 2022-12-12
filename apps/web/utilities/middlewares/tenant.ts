import { z } from 'zod';
import { findAccountByPath } from 'lib/models';
import { Forbidden, NotFound, Unauthorized } from 'utilities/exceptions';
import jwtMiddleware from 'utilities/middlewares/jwt';

const schema = z.object({
  communityName: z.string().min(1),
});

export const tenantMiddleware = async (req: any, res: any, next: any) => {
  try {
    // TODO: move to middleware
    const { communityName } = schema.parse({ ...req.body, ...req.query });
    // ---
    // improvement: cache the findAccountByPath function
    const account = await findAccountByPath(communityName);
    if (!account) {
      return next(new NotFound());
    }
    // assign the tenant in the req object for easy access later
    req.tenant = account;
    if (account.type === 'PRIVATE') {
      // if account is private we enable the jwt token validation
      // if it doesn't exist in the header, it will throw 401, otherwise next will be called
      await new Promise((resolve, _) => jwtMiddleware()(req, res, resolve));

      if (!req.user) {
        return next(new Unauthorized());
      }
      // the user must have at least a role in the tenant
      const user = req.user.users?.find(
        (u: any) => u.accountsId === req.tenant.id
      );
      if (!user) {
        return next(new Forbidden());
      }
      // assign the user in the req object for easy access later
      req.tenant_user = user;
    }
    return next();
  } catch (error) {
    return next(error);
  }
};
