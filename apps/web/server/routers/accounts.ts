import { Router } from 'express';
import {
  AuthedRequest,
  AuthedRequestWithBody,
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
import { promiseMemoize } from '@linen/utilities/memoize';
import { inviteNewMembers } from 'services/invites';

const prefix = '/api/accounts';
const accountsRouter = Router();

async function _findCommunities(includeFreeTier: boolean = false) {
  const data = await AccountsService.showcase(includeFreeTier);
  const urls = await Promise.all(
    data.map(async (url) =>
      fetch(url, { method: 'HEAD' })
        .then((r) => (r.ok ? url : null))
        .catch((_) => null)
    )
  );
  return urls.filter((e) => !!e);
}

const findCommunities = promiseMemoize(_findCommunities);

accountsRouter.get(
  `${prefix}/showcase`,
  async (req: AuthedRequest, res: Response) => {
    const { includeFreeTier } = req.query;
    res.json(await findCommunities(!!includeFreeTier));
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

accountsRouter.use(onError);

export default accountsRouter.use(onError);
