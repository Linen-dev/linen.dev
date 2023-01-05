import { Router } from 'express';
import {
  AuthedRequest,
  AuthedRequestWithBody,
  AuthedRequestWithTenantAndBody,
  Response,
} from 'server/types';
import tenantMiddleware, { Roles } from 'server/middlewares/tenant';
import validationMiddleware from 'server/middlewares/validation';
import jwtMiddleware from 'server/middlewares/jwt';
import AccountsService from 'services/accounts';
import {
  createAccountSchema,
  createAccountType,
  integrationDiscordSchema,
  integrationDiscordType,
  updateAccountSchema,
  updateAccountType,
} from './accounts.types';
import { onError } from 'server/middlewares/error';

const prefix = '/api/accounts';
const accountsRouter = Router();

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
      ...req.body,
    });
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

accountsRouter.post(
  `${prefix}/integration/discord`,
  tenantMiddleware([Roles.OWNER, Roles.ADMIN]),
  validationMiddleware(integrationDiscordSchema, 'body'),
  async (
    req: AuthedRequestWithTenantAndBody<integrationDiscordType>,
    res: Response
  ) => {
    const accountId = req.tenant?.id!;
    const data = await AccountsService.setCustomBotDiscord({
      ...req.body,
      accountId,
    });
    res.json(data);
    res.end();
  }
);

accountsRouter.use(onError);

export default accountsRouter.use(onError);
