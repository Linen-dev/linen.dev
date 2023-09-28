import { Router } from 'express';
import { z } from 'zod';
import {
  AuthedRequestWithBody,
  Response,
  Permissions,
  validatePermissionsResponse,
  SerializedChannel,
} from '@linen/types';
import { serializeAccount } from '@linen/serializers/account';
import { serializeChannel } from '@linen/serializers/channel';
import validationMiddleware from 'server/middlewares/validation';
import CommunityService from 'services/community';
import PermissionsService from 'services/permissions';
import { allowAccess, fetchCommon } from 'services/ssr/common';

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

  const {
    communities,
    currentCommunity,
    privateChannels,
    settings,
    dmChannels,
    joinedChannels,
  } = await fetchCommon(permissions, community);

  return {
    token: permissions.token,
    currentCommunity,
    channels: [...joinedChannels, ...privateChannels] as SerializedChannel[],
    communities: communities.map(serializeAccount),
    permissions,
    settings,
    dms: dmChannels,
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
      const props = await getProps(req, res, allowAccess);
      res.json(props);
    } catch (error: any) {
      res.status(error.status || 500);
    }
    res.end();
  }
);

export default ssrRouter;
