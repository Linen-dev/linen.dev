import { createRouter } from 'next-connect';
import { z } from 'zod';
import type { ApiResponse, TenantApiRequest } from 'api/types';
import { serialize } from 'api/serialize';
import { AccountNotFound } from 'api/errors';
import { tenantMiddleware } from 'api/middlewares/tenant';
import { serialize as serializeAccount } from 'serializers/account/settings';

const getSchema = z.object({
  communityName: z.string().min(1),
});

const routes = createRouter<TenantApiRequest, ApiResponse>()
  // GET /api/v2/accounts
  .get('/accounts', tenantMiddleware, async (req, res) => {
    const { communityName } = getSchema.parse(req.query);
    console.log({ communityName });
    if (req.tenant) {
      const settings = serializeAccount(req.tenant);
      return res.json(serialize(settings));
    }
    return AccountNotFound(res);
  });

export default routes;
