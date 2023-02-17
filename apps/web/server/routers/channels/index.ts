import { Router } from 'express';
import { onError } from 'server/middlewares/error';
import tenantMiddleware, { Roles } from 'server/middlewares/tenant';
import validationMiddleware from 'server/middlewares/validation';
import { BadRequest, NotFound, NotImplemented } from 'server/exceptions';
import {
  AuthedRequestWithTenantAndBody,
  NextFunction,
  Response,
} from 'server/types';
import { v4 } from 'uuid';
import ChannelsService from 'services/channels';
import { Prisma, prisma } from '@linen/database';
import {
  bulkHideChannelsSchema,
  bulkHideChannelsType,
  createChannelSchema,
  createChannelType,
  getChannelIntegrationsSchema,
  getChannelIntegrationsType,
  postChannelIntegrationsType,
  setDefaultChannelSchema,
  setDefaultChannelType,
} from '@linen/types';
import serializeChannel from 'serializers/channel';
import { serialize } from 'superjson';
import { postChannelIntegrationsSchema } from '@linen/types';

const prefix = '/api/channels';

const channelsRouter = Router();

channelsRouter.get(
  `${prefix}/:channelId/integrations`,
  tenantMiddleware([Roles.ADMIN, Roles.OWNER, Roles.MEMBER]),
  validationMiddleware(getChannelIntegrationsSchema),
  async (
    req: AuthedRequestWithTenantAndBody<getChannelIntegrationsType>,
    res: Response,
    next: NextFunction
  ) => {
    const channelIntegration = await prisma.channelsIntegration.findFirst({
      select: { data: true, type: true, externalId: true },
      where: {
        channel: { id: req.body.channelId, accountId: req.tenant?.id! },
      },
    });

    if (!channelIntegration) return next(new NotFound());

    return res.json(
      serialize({
        ...channelIntegration,
        data: {
          ...(channelIntegration?.data as any),
          ...(!!(channelIntegration?.data as any)?.access_token && {
            access_token: '***',
          }),
        },
      }).json
    );
  }
);

channelsRouter.post(
  `${prefix}/:channelId/integrations`,
  tenantMiddleware([Roles.ADMIN, Roles.OWNER]),
  validationMiddleware(postChannelIntegrationsSchema),
  async (
    req: AuthedRequestWithTenantAndBody<postChannelIntegrationsType>,
    res: Response,
    next: NextFunction
  ) => {
    const channel = await prisma.channels.findFirst({
      where: { accountId: req.tenant?.id!, id: req.body.channelId },
    });
    if (!channel) {
      return next(new NotFound());
    }
    const integration = await prisma.channelsIntegration.create({
      select: { id: true },
      data: {
        externalId: req.body.externalId || 'pending',
        type: req.body.type,
        channelId: channel.id,
        createdByUserId: req.tenant_user?.id!,
        data: req.body.data,
      },
    });
    if (!integration) {
      return next({ status: 500 });
    }
    return res.json(integration);
  }
);

channelsRouter.post(
  `${prefix}`,
  tenantMiddleware([Roles.ADMIN, Roles.OWNER]),
  validationMiddleware(createChannelSchema),
  async (
    req: AuthedRequestWithTenantAndBody<createChannelType>,
    res: Response,
    next: NextFunction
  ) => {
    const { channelName, slackChannelId } = req.body;

    // TODO: move to services
    const result = await prisma.channels.findFirst({
      where: {
        channelName,
        accountId: req.tenant?.id!,
      },
    });

    if (result) {
      return next(new BadRequest('Channel with this name already exists'));
    }

    const channel = await ChannelsService.findOrCreateChannel({
      externalChannelId: slackChannelId || v4(),
      channelName,
      accountId: req.tenant?.id!,
    });
    return res.status(200).json(serializeChannel(channel));
  }
);

channelsRouter.post(
  `${prefix}/hide`,
  tenantMiddleware([Roles.ADMIN, Roles.OWNER]),
  validationMiddleware(bulkHideChannelsSchema),
  async (
    req: AuthedRequestWithTenantAndBody<bulkHideChannelsType>,
    res: Response,
    next: NextFunction
  ) => {
    const { channels } = req.body;
    await ChannelsService.updateChannelsVisibility({
      channels,
      accountId: req.tenant?.id!,
    });
    return res.status(200).json({});
  }
);

channelsRouter.post(
  `${prefix}/default`,
  tenantMiddleware([Roles.ADMIN, Roles.OWNER]),
  validationMiddleware(setDefaultChannelSchema),
  async (
    req: AuthedRequestWithTenantAndBody<setDefaultChannelType>,
    res: Response,
    next: NextFunction
  ) => {
    const { channelId, originalChannelId } = req.body;
    await ChannelsService.setDefaultChannel({
      newDefaultChannelId: channelId,
      oldDefaultChannelId: originalChannelId,
      accountId: req.tenant?.id!,
    });
    return res.status(200).json({});
  }
);

channelsRouter.all(`${prefix}*`, (_: any, _2: any, next: NextFunction) => {
  next(new NotImplemented());
});
channelsRouter.use(onError);

export default channelsRouter;
