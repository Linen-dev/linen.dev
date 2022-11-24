import errorMiddleware from 'api/middlewares/error';
import { roleMiddleware, Roles } from 'api/middlewares/roles';
import { tenantMiddleware } from 'api/middlewares/tenant';
import { Router, NextFunction, Response } from 'express';

const DemoRoute = Router()
  // routes
  .get(
    '/demo',
    tenantMiddleware,
    // roleMiddleware need to run after tenantMiddleware
    // because it validate the role against the current tenant
    roleMiddleware([Roles.OWNER]),
    async (req: any, res: Response, next: NextFunction) => {
      res.json({ role: req.tenant_user?.role });
      next();
    }
  )
  .use('/demo', errorMiddleware);

export default DemoRoute;
