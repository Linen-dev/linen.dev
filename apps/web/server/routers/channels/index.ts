import { Router } from 'express';
import { onError } from 'server/middlewares/error';
import tenantMiddleware, { Roles } from 'server/middlewares/tenant';
import validationMiddleware from 'server/middlewares/validation';
import {
  BadRequest,
  Forbidden,
  NotFound,
  NotImplemented,
} from 'server/exceptions';
import { v4 } from 'uuid';
import ChannelsService from 'services/channels';
import { prisma, ChannelType } from '@linen/database';
import {
  AuthedRequestWithTenantAndBody,
  NextFunction,
  Response,
  archiveChannelSchema,
  archiveChannelType,
  bulkHideChannelsSchema,
  bulkHideChannelsType,
  createChannelSchema,
  createChannelType,
  updateChannelSchema,
  createDmSchema,
  createDmType,
  getChannelIntegrationsSchema,
  getChannelIntegrationsType,
  postChannelIntegrationsType,
  setDefaultChannelSchema,
  setDefaultChannelType,
  updateChannelType,
  postChannelIntegrationsSchema,
  getChannelMembersSchema,
  getChannelMembersType,
  putChannelMembersSchema,
  putChannelMembersType,
} from '@linen/types';
import { serializeChannel } from '@linen/serializers/channel';
import { serialize } from 'superjson';
import { serializeUser } from '@linen/serializers/user';

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

channelsRouter.get(
  `${prefix}/stats`,
  tenantMiddleware([Roles.ADMIN, Roles.OWNER]),
  async (
    req: AuthedRequestWithTenantAndBody<{}>,
    res: Response,
    next: NextFunction
  ) => {
    const channels = await ChannelsService.findWithStats(req.tenant?.id!);
    return res.json(channels);
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
    const { channelName, slackChannelId, channelPrivate, usersId } = req.body;

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

    if (channelPrivate) {
      const channel = await ChannelsService.createPrivateChannel({
        externalChannelId: v4(),
        channelName,
        accountId: req.tenant?.id!,
        ownerId: req.tenant_user?.id!,
        usersId,
      });
      return res.status(200).json(serializeChannel(channel));
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
  `${prefix}/dm`,
  tenantMiddleware([Roles.ADMIN, Roles.OWNER, Roles.MEMBER]),
  validationMiddleware(createDmSchema),
  async (
    req: AuthedRequestWithTenantAndBody<createDmType>,
    res: Response,
    next: NextFunction
  ) => {
    const { userId } = req.body;
    const dm = await ChannelsService.findOrCreateDM({
      accountId: req.tenant?.id!,
      userId: req.tenant_user?.id!,
      dmWithUserId: userId,
    });
    return res.status(200).json(dm);
  }
);

channelsRouter.post(
  `${prefix}/archive`,
  tenantMiddleware([Roles.ADMIN, Roles.OWNER, Roles.MEMBER]),
  validationMiddleware(archiveChannelSchema),
  async (
    req: AuthedRequestWithTenantAndBody<archiveChannelType>,
    res: Response,
    next: NextFunction
  ) => {
    await ChannelsService.archiveChannel({
      userId: req.tenant_user?.id!,
      channelId: req.body.channelId,
    });
    return res.status(200).json({});
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

channelsRouter.put(
  `${prefix}/:channelId`,
  tenantMiddleware([Roles.OWNER, Roles.ADMIN]),
  validationMiddleware(updateChannelSchema),
  async (
    req: AuthedRequestWithTenantAndBody<updateChannelType>,
    res: Response,
    next: NextFunction
  ) => {
    await prisma.channels.update({
      where: { id: req.body.channelId },
      data: {
        channelName: req.body.channelName,
        type: req.body.channelPrivate
          ? ChannelType.PRIVATE
          : ChannelType.PUBLIC,
      },
    });
    return res.status(200).json({});
  }
);

channelsRouter.get(
  `${prefix}/:channelId/members`,
  tenantMiddleware([Roles.ADMIN, Roles.OWNER, Roles.MEMBER]),
  validationMiddleware(getChannelMembersSchema),
  async (
    req: AuthedRequestWithTenantAndBody<getChannelMembersType>,
    res: Response,
    next: NextFunction
  ) => {
    const members = await prisma.channels.findFirst({
      select: { memberships: { select: { user: true } } },
      where: {
        accountId: req.tenant?.id,
        id: req.body.channelId,
      },
    });

    if (!members) {
      return next(new NotFound());
    }
    const canAccess = members.memberships.find(
      (m) => m.user.id === req.tenant_user?.id
    );
    if (!canAccess) {
      return next(new Forbidden());
    }
    const serializedMembers = members.memberships.map((m) =>
      serializeUser(m.user)
    );
    return res.json(serializedMembers);
  }
);

channelsRouter.put(
  `${prefix}/:channelId/members`,
  tenantMiddleware([Roles.ADMIN, Roles.OWNER, Roles.MEMBER]),
  validationMiddleware(putChannelMembersSchema),
  async (
    req: AuthedRequestWithTenantAndBody<putChannelMembersType>,
    res: Response,
    next: NextFunction
  ) => {
    const members = await prisma.channels.findFirst({
      select: { memberships: { select: { user: true } } },
      where: {
        accountId: req.tenant?.id,
        id: req.body.channelId,
      },
    });

    if (!members) {
      return next(new NotFound());
    }
    const canAccess = members.memberships.find(
      (m) => m.user.id === req.tenant_user?.id
    );
    if (!canAccess) {
      return next(new Forbidden());
    }

    const toRemove = members.memberships
      .filter((m) => !req.body.usersId.some((u) => m.user.id === u))
      .map((u) => u.user.id);

    const toInsert = req.body.usersId
      .filter((u) => !members.memberships.some((m) => m.user.id === u))
      .map((userId) => ({
        usersId: userId,
        channelsId: req.body.channelId,
      }));

    toRemove.length > 0 &&
      (await prisma.memberships.deleteMany({
        where: {
          channelsId: req.body.channelId,
          usersId: { in: toRemove },
        },
      }));
    toInsert.length > 0 &&
      (await prisma.memberships.createMany({
        data: toInsert,
      }));

    return res.json({});
  }
);

channelsRouter.all(`${prefix}*`, (_: any, _2: any, next: NextFunction) => {
  next(new NotImplemented());
});
channelsRouter.use(onError);

export default channelsRouter;
