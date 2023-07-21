import { Router } from 'express';
import {
  AuthedRequest,
  AuthedRequestWithBody,
  AuthedRequestWithTenant,
  AuthedRequestWithTenantAndBody,
  Response,
  createAccountSchema,
  createAccountType,
  updateAccountSchema,
  updateAccountType,
} from '@linen/types';
import tenantMiddleware, { Roles } from 'server/middlewares/tenant';
import validationMiddleware from 'server/middlewares/validation';
import jwtMiddleware from 'server/middlewares/jwt';
import AccountsService from 'services/accounts';
import { onError } from 'server/middlewares/error';
import { ApiEvent, trackApiEvent } from 'utilities/ssr-metrics';
import { inviteNewMembers } from 'services/invites';
import axios from 'axios';
import { prisma } from '@linen/database';
import { eventNewIntegration } from 'services/events/eventNewIntegration';

const prefix = '/api/accounts';
const accountsRouter = Router();

accountsRouter.get(
  `${prefix}/showcase`,
  async (req: AuthedRequest, res: Response) => {
    res.json(await AccountsService.showcase());
    res.end();
  }
);

accountsRouter.get(
  `${prefix}`,
  jwtMiddleware(),
  async (req: AuthedRequest, res: Response) => {
    const data = await AccountsService.getAllByAuth({
      authId: req.session_user?.id!,
    });
    res.json(data);
    res.end();
  }
);

accountsRouter.post(
  `${prefix}`,
  jwtMiddleware(),
  validationMiddleware(createAccountSchema, 'body'),
  async (req: AuthedRequestWithBody<createAccountType>, res: Response) => {
    const { status, ...data } = await AccountsService.create({
      email: req.session_user?.email!,
      channels: req.body.channels,
      description: req.body.description,
      name: req.body.name,
      slackDomain: req.body.slackDomain,
    });
    if (status === 200) {
      try {
        if (data.ownerUser && req.body.members && data.id) {
          await inviteNewMembers({
            emails: req.body.members,
            ownerUser: data.ownerUser,
            accountId: data.id,
          });
        }
      } catch (error) {}
      await trackApiEvent({ req, res }, ApiEvent.user_create_community);
    }
    res.status(status).json(data);
    res.end();
  }
);

accountsRouter.put(
  `${prefix}`,
  tenantMiddleware([Roles.OWNER, Roles.ADMIN]),
  validationMiddleware(updateAccountSchema, 'body'),
  async (
    req: AuthedRequestWithTenantAndBody<updateAccountType>,
    res: Response
  ) => {
    const accountId = req.tenant?.id!;
    const { status, ...data } = await AccountsService.update({
      accountId,
      params: req.body,
      tags: req.body.tags,
    });
    res.status(status).json(data);
    res.end();
  }
);

accountsRouter.delete(
  `${prefix}/:accountId`,
  tenantMiddleware([Roles.OWNER]),
  async (req: AuthedRequestWithTenantAndBody<{}>, res: Response) => {
    const accountId = req.tenant?.id!;
    await AccountsService.remove({ accountId });
    res.json({});
    res.end();
  }
);

accountsRouter.get(
  `${prefix}/validate-domain`,
  tenantMiddleware([Roles.OWNER, Roles.ADMIN]),
  async (req: AuthedRequestWithTenantAndBody<{}>, res: Response) => {
    const accountId = req.tenant?.id!;
    const account = await prisma.accounts.findUnique({
      where: { id: accountId },
      select: { redirectDomain: true, redirectDomainPropagate: true },
    });
    if (!account) {
      return res.status(404);
    }

    const stats = await axios
      .head(`https://${account.redirectDomain}/api/health`)
      .catch(() => ({ status: 500 }));

    const isWorking = stats.status === 200;

    await prisma.accounts.update({
      where: { id: accountId },
      data: { redirectDomainPropagate: isWorking },
    });

    return res.json({
      ok: isWorking,
      cause:
        'Custom domain is not yet propagated or misconfigured, try again later or contact Linen support',
    });
  }
);

accountsRouter.post(
  `${prefix}/sync`,
  tenantMiddleware([Roles.OWNER, Roles.ADMIN]),
  async (req: AuthedRequestWithTenant, res: Response) => {
    await eventNewIntegration({ accountId: req.tenant?.id! });
    res.status(200).json({ ok: true });
    res.end();
  }
);

accountsRouter.use(onError);

export default accountsRouter.use(onError);
