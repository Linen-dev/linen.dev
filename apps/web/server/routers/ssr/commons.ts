import { Router } from 'express';
import { z } from 'zod';
import {
  AuthedRequestWithBody,
  Response,
  Permissions,
  validatePermissionsResponse,
} from '@linen/types';
import { serializeAccount } from '@linen/serializers/account';
import { serializeChannel } from '@linen/serializers/channel';
import { serializeSettings } from '@linen/serializers/settings';
import validationMiddleware from 'server/middlewares/validation';
import ChannelsService, { getDMs } from 'services/channels';
import CommunityService from 'services/community';
import PermissionsService from 'services/permissions';
import { allowInbox } from 'services/ssr/common';

const prefix = '/api/ssr/commons';
const ssrRouter = Router();

const getSchema = z.object({
  communityName: z.string(),
});

async function getProps(
  req: AuthedRequestWithBody<z.infer<typeof getSchema>>,
  res: Response,
  validatePermissions: (permissions: Permissions) => validatePermissionsResponse
) {
  const { communityName } = req.body;

  const community = await CommunityService.find({ communityName });
  if (!community) {
    throw { status: 404 };
  }

  const permissions = await PermissionsService.get({
    params: { communityName },
    request: req,
    response: res,
  });

  const isAllow = validatePermissions(permissions);
  if (isAllow.redirect) {
    if (isAllow.error === 'forbidden') {
      throw { status: 403 };
    }
    if (isAllow.error === 'private') {
      throw { status: 401 };
    }
    // unknown
    throw { status: 500 };
  }

  const channels = await ChannelsService.find(community.id);
  const privateChannels = !!permissions.user?.id
    ? await ChannelsService.findPrivates({
        accountId: community.id,
        userId: permissions.user.id,
      })
    : [];

  const settings = serializeSettings(community);
  const communities = !!permissions.auth?.id
    ? await CommunityService.findByAuthId(permissions.auth.id)
    : [];

  const currentCommunity = serializeAccount(community);

  const dms = !!permissions.user?.id
    ? await getDMs({
        accountId: currentCommunity.id,
        userId: permissions.user.id,
      })
    : [];

  return {
    token: permissions.token,
    currentCommunity,
    channels: [...channels, ...privateChannels].map(serializeChannel),
    communities: communities.map(serializeAccount),
    permissions,
    settings,
    dms: dms.map(serializeChannel),
    isSubDomainRouting: false,
    isBot: false,
  };
}

// reused by inbox, starred
ssrRouter.get(
  `${prefix}`,
  validationMiddleware(getSchema, 'query'),
  async (
    req: AuthedRequestWithBody<z.infer<typeof getSchema>>,
    res: Response
  ) => {
    try {
      const props = await getProps(req, res, allowInbox);
      res.json(props);
    } catch (error: any) {
      res.status(error.status || 500);
    }
    res.end();
  }
);

export default ssrRouter;
