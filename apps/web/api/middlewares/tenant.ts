import { z } from 'zod';
import { AccountType } from '@prisma/client';
import { findAccountByPath } from 'lib/models';
import type { ApiResponse, TenantApiRequest } from 'api/types';
import passport from 'api/auth/passport';
import { AccountNotFound, Unauthorized, Validation } from 'api/errors';

const schema = z.object({
  communityName: z.string().min(1),
});

export const tenantMiddleware = async (
  req: TenantApiRequest,
  res: ApiResponse,
  next: any
) => {
  let parsed;
  try {
    parsed = schema.parse({ ...req.body, ...req.query });
  } catch (error) {
    return Validation(res, error);
  }
  const { communityName } = parsed;
  // improvement: cache the findAccountByPath function
  const account = await findAccountByPath(communityName);
  if (!account) {
    return AccountNotFound(res);
  }
  // assign the tenant in the req object for easy access later
  req.tenant = account;
  if (account.type === AccountType.PRIVATE) {
    // if account is private we enable the jwt token validation
    // if it doesn't exist in the header, it will throw 401, otherwise next will be called
    await new Promise((resolve, _) => {
      passport.authenticate('jwt', {
        session: false,
      })(req, res, resolve);
    });

    if (!req.user) {
      return Unauthorized(res, 'user is not logged in');
    }
    // the user must have at least a role in the tenant
    const user = req.user.users?.find(
      (u: any) => u.accountsId === req.tenant.id
    );
    if (!user) {
      return Unauthorized(res, 'user does not belongs to tenant');
    }
    // assign the user in the req object for easy access later
    req.tenant_user = user;
  }
  return next();
};
