import { createRouter } from 'next-connect';
import { z } from 'zod';
import { prisma } from 'client';
import { getThreads } from 'services/channel';
import type { ApiResponse, TenantApiRequest } from 'api/types';
import { serialize } from 'api/serialize';
import { ChannelNotFound } from 'api/errors';
import { tenantMiddleware } from 'api/middlewares/tenant';
import { roleMiddleware, Roles } from 'api/middlewares/roles';

const getSchema = z.object({
  communityName: z.string().min(1),
  channelName: z.optional(z.string().min(1)),
});

const routes = createRouter<TenantApiRequest, ApiResponse>()
  // GET /api/v2/threads
  .get(
    '/threads',
    // tenant middleware will check if the account is private
    // plus if the user has access to the account
    tenantMiddleware,
    async (req, res) => {
      const { channelName } = getSchema.parse(req.query);

      // improvement: move this to service
      const where = !!channelName
        ? { accountId: req.tenant.id, channelName }
        : { accountId: req.tenant.id, default: true };

      const channel = await prisma.channels.findFirst({ where });
      if (!channel) {
        return ChannelNotFound(res);
      }
      const data = await getThreads(channel.id, req.tenant.anonymizeUsers);
      return res.json(serialize(data));
    }
  )
  // example
  .post(
    '/threads',
    tenantMiddleware,
    // roleMiddleware need to run after tenantMiddleware
    // because it validate the role against the current tenant
    roleMiddleware([Roles.ADMIN]),
    async (req, res) => {
      res.json({ role: req.tenant_user?.role });
    }
  );

export default routes;
