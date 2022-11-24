import { Forbidden, Unauthorized } from 'api/exceptions/HttpException';
import { NextFunction, Response } from 'express';

// improvement: be able to use typed Roles from prisma
const Roles = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
};

// we must use authMiddleware before roleMiddleware
// authMiddleware creates the tenant_user prop that has the role of the user by given tenant
const roleMiddleware =
  (roles: string[]) => (req: any, res: Response, next: NextFunction) => {
    if (!req.tenant_user) {
      // tenant_user is created with authMiddleware, we must use authMiddleware before roleMiddleware
      next(new Unauthorized());
    }
    const hasRole = roles.find((role: any) => req.tenant_user?.role === role);
    if (!hasRole) {
      next(new Forbidden());
    }
    next();
  };

export { Roles, roleMiddleware };
