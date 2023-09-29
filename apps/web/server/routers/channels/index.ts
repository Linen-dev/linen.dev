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
  bulkReorderChannelsSchema,
  bulkReorderChannelsType,
  createChannelSchema,
  createChannelType,
  deleteChannelSchema,
  deleteChannelType,
  updateChannelSchema,
  createDmSchema,
  createDmType,
  getChannelsSchema,
  getChannelIntegrationsSchema,
  getChannelIntegrationsType,
  postChannelIntegrationsType,
  setDefaultChannelsSchema,
  setDefaultChannelsType,
  setLandingChannelSchema,
  setLandingChannelType,
  updateChannelType,
  postChannelIntegrationsSchema,
  getChannelMembersSchema,
  getChannelMembersType,
  putChannelMembersSchema,
  putChannelMembersType,
  leaveChannelSchema,
  leaveChannelType,
  joinChannelSchema,
  joinChannelType,
} from '@linen/types';
import { serializeChannel } from '@linen/serializers/channel';
import { serialize } from 'superjson';
import { serializeUser } from '@linen/serializers/user';
import { eventChannelUpdate } from 'services/events/eventChannelUpdate';
import { eventChannelDeletion } from 'services/events/eventChannelDeletion';
import { sortByDisplayOrder } from '@linen/utilities/object';

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

channelsRouter.get(
  `${prefix}`,
  tenantMiddleware([Roles.ADMIN, Roles.OWNER, Roles.MEMBER]),
  validationMiddleware(getChannelsSchema),
  async (
    req: AuthedRequestWithTenantAndBody<createChannelType>,
    res: Response
  ) => {
    const channels = await ChannelsService.findPublic(req.tenant?.id!);
    return res
      .status(200)
      .json({
        channels: channels.map(serializeChannel).sort(sortByDisplayOrder),
      });
  }
);

channelsRouter.delete(
  `${prefix}`,
  tenantMiddleware([Roles.ADMIN, Roles.OWNER]),
  validationMiddleware(deleteChannelSchema),
  async (
    req: AuthedRequestWithTenantAndBody<deleteChannelType>,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.body;

    try {
      const channel = await prisma.channels.findUnique({
        select: { id: true, accountId: true, channelName: true },
        where: {
          id,
        },
        rejectOnNotFound: true,
      });
      if (!channel.accountId || channel.accountId !== req.tenant?.id!) {
        // if channel accountId is missing or belongs to another account, throw forbidden
        return next(new Forbidden());
      }
      await prisma.channels.delete({ where: { id } });
      await eventChannelDeletion({
        channelId: channel.id,
        channelName: channel.channelName,
        accountId: channel.accountId,
      });
    } catch (exception) {
      return res.status(500).json({});
    }

    return res.status(200).json({});
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
    const { channelName, slackChannelId, channelPrivate, usersId, viewType } =
      req.body;

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
        viewType,
      });
      return res.status(200).json(serializeChannel(channel));
    }

    const channel = await ChannelsService.findOrCreateChannel({
      externalChannelId: slackChannelId || v4(),
      channelName,
      accountId: req.tenant?.id!,
      viewType,
      members: [req.tenant_user?.id!],
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
  `${prefix}/join`,
  tenantMiddleware([Roles.ADMIN, Roles.OWNER, Roles.MEMBER]),
  validationMiddleware(joinChannelSchema),
  async (
    req: AuthedRequestWithTenantAndBody<joinChannelType>,
    res: Response,
    next: NextFunction
  ) => {
    const { channelId } = req.body;
    await ChannelsService.joinChannel({
      channelId,
      userId: req.tenant_user?.id!,
    });
    return res.status(200).json({});
  }
);

channelsRouter.post(
  `${prefix}/reorder`,
  tenantMiddleware([Roles.ADMIN, Roles.OWNER]),
  validationMiddleware(bulkReorderChannelsSchema),
  async (
    req: AuthedRequestWithTenantAndBody<bulkReorderChannelsType>,
    res: Response,
    next: NextFunction
  ) => {
    const { channels } = req.body;
    await ChannelsService.reorder({
      channels,
      accountId: req.tenant?.id!,
    });
    return res.status(200).json({});
  }
);

channelsRouter.post(
  `${prefix}/default`,
  tenantMiddleware([Roles.ADMIN, Roles.OWNER]),
  validationMiddleware(setDefaultChannelsSchema),
  async (
    req: AuthedRequestWithTenantAndBody<setDefaultChannelsType>,
    res: Response,
    next: NextFunction
  ) => {
    const { channelIds } = req.body;
    await ChannelsService.setDefaultChannels({
      channelIds,
      accountId: req.tenant?.id!,
    });
    return res.status(200).json({});
  }
);

channelsRouter.post(
  `${prefix}/landing`,
  tenantMiddleware([Roles.ADMIN, Roles.OWNER]),
  validationMiddleware(setLandingChannelSchema),
  async (
    req: AuthedRequestWithTenantAndBody<setLandingChannelType>,
    res: Response,
    next: NextFunction
  ) => {
    const { channelId } = req.body;
    await ChannelsService.setLandingChannel({
      channelId,
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
    request: AuthedRequestWithTenantAndBody<updateChannelType>,
    response: Response,
    next: NextFunction
  ) => {
    const {
      channelId,
      channelName,
      channelDefault,
      channelPrivate,
      viewType,
      landing,
      readonly,
      hidden,
    } = request.body;
    const channel = await prisma.channels.findUnique({
      where: { id: channelId },
    });
    if (!channel) {
      return response.status(404);
    }
    if (landing === true) {
      await ChannelsService.setLandingChannel({
        accountId: request.tenant?.id!,
        channelId,
      });
    }
    const newType = channelPrivate ? ChannelType.PRIVATE : ChannelType.PUBLIC;
    await prisma.channels.update({
      where: { id: channelId },
      data: {
        channelName,
        type: newType,
        ...(channelPrivate && {
          memberships: {
            createMany: {
              skipDuplicates: true,
              data: [{ usersId: request.tenant_user?.id! }],
            },
          },
        }),
        viewType,
        default: channelDefault,
        landing,
        readonly,
        hidden,
      },
    });
    await eventChannelUpdate({
      channelId: channel.id,
      isNameChanged: channel.channelName !== channelName,
      isTypeChanged: channel.type !== newType,
    });
    return response.status(200).json({});
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

channelsRouter.post(
  `${prefix}/:channelId/leave`,
  tenantMiddleware([Roles.ADMIN, Roles.OWNER, Roles.MEMBER]),
  validationMiddleware(leaveChannelSchema),
  async (
    req: AuthedRequestWithTenantAndBody<leaveChannelType>,
    res: Response,
    next: NextFunction
  ) => {
    const channel = await prisma.channels.findFirst({
      where: {
        accountId: req.tenant?.id,
        id: req.body.channelId,
        memberships: { some: { usersId: req.tenant_user?.id! } },
      },
    });

    if (channel) {
      await prisma.memberships.delete({
        where: {
          usersId_channelsId: {
            channelsId: req.body.channelId,
            usersId: req.tenant_user?.id!,
          },
        },
      });
      return res.json({ ok: true });
    }

    return res.json({ ok: false });
  }
);

channelsRouter.all(`${prefix}*`, (_: any, _2: any, next: NextFunction) => {
  next(new NotImplemented());
});
channelsRouter.use(onError);

export default channelsRouter;
