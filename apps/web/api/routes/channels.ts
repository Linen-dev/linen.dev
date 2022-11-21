import { createRouter } from 'next-connect';
import { z } from 'zod';
import type { ApiResponse, TenantApiRequest } from 'api/types';
import { serialize } from 'api/serialize';
import { tenantMiddleware } from 'api/middlewares/tenant';
import { findChannelsByAccount } from 'lib/channel';

const getSchema = z.object({
  communityName: z.string().min(1),
});

const routes = createRouter<TenantApiRequest, ApiResponse>()
  // GET /api/v2/channels
  .get('/channels', tenantMiddleware, async (req, res) => {
    const { communityName } = getSchema.parse(req.query);
    console.log({ communityName });
    const data = await findChannelsByAccount({
      account: req.tenant,
      isCrawler: false,
    });
    return res.json(serialize(data));
  });

export default routes;
