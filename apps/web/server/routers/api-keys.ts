import { Router } from 'express';
import {
  AuthedRequestWithTenant,
  AuthedRequestWithTenantAndBody,
  Response,
} from '@linen/types';
import { ApiKeysService } from 'services/api-keys';
import tenantMiddleware, { Roles } from 'server/middlewares/tenant';
import validationMiddleware from 'server/middlewares/validation';
import {
  createKeySchema,
  createKeyType,
  revokeKeySchema,
  revokeKeyType,
} from './api-keys.types';
import { onError } from 'server/middlewares/error';

const prefix = '/api/api-keys';
const apiKeysRouter = Router();

apiKeysRouter.get(
  `${prefix}`,
  tenantMiddleware([Roles.OWNER, Roles.ADMIN]),
  async (req: AuthedRequestWithTenant, res: Response) => {
    const accountId = req.tenant?.id!;
    const data = await ApiKeysService.list({ accountId });
    res.json(data);
    res.end();
  }
);

apiKeysRouter.post(
  `${prefix}`,
  tenantMiddleware([Roles.OWNER, Roles.ADMIN]),
  validationMiddleware(createKeySchema, 'body'),
  async (req: AuthedRequestWithTenantAndBody<createKeyType>, res: Response) => {
    const accountId = req.tenant?.id!;
    const { name, scope } = req.body;
    const data = await ApiKeysService.create({ accountId, name, scope });
    res.json(data);
    res.end();
  }
);

apiKeysRouter.delete(
  `${prefix}`,
  tenantMiddleware([Roles.OWNER, Roles.ADMIN]),
  validationMiddleware(revokeKeySchema, 'body'),
  async (req: AuthedRequestWithTenantAndBody<revokeKeyType>, res: Response) => {
    const accountId = req.tenant?.id!;
    const { id } = req.body;
    const data = await ApiKeysService.revoke({ accountId, id });
    res.json(data);
    res.end();
  }
);

apiKeysRouter.use(onError);

export default apiKeysRouter;
