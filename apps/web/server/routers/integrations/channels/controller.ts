import { BaseController } from 'server/routers/integrations/base-controller';
import { AuthedRequestWithBody, NextFunction, Response } from 'server/types';
import {
  channelFindOrCreateType,
  channelGetIntegrationType,
  channelGetType,
  channelPutIntegrationType,
} from '@linen/types';
import ChannelsService from 'services/channels';
import { BadRequest, NotFound } from 'server/exceptions';
import { serializeChannel } from '@linen/serializers/channel';

export class ChannelsController extends BaseController {
  static async get(
    req: AuthedRequestWithBody<channelGetType>,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!!req.body.channelId) {
        const channel = await ChannelsService.findById(req.body.channelId);
        if (!channel) {
          return next(new NotFound());
        }
        return res.json(serializeChannel(channel));
      }

      if (!!req.body.integrationId) {
        const channel = await ChannelsService.findByExternalIntegrationId(
          req.body.integrationId
        );
        if (!channel) {
          return next(new NotFound());
        }
        return res.json(serializeChannel(channel));
      }

      return next(new BadRequest());
    } catch (err) {
      console.error(err);
      return next({ status: 500 });
    }
  }
  static async getIntegration(
    req: AuthedRequestWithBody<channelGetIntegrationType>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const integration = await ChannelsService.getChannelIntegration({
        channelId: req.body.channelId,
        type: req.body.type,
      });
      if (integration) {
        return res.json(integration);
      }
      return next(new NotFound());
    } catch (err) {
      console.error(err);
      return next({ status: 500 });
    }
  }

  static async putIntegration(
    req: AuthedRequestWithBody<channelPutIntegrationType>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const integration = await ChannelsService.putChannelIntegration({
        ...req.body,
      });
      return res.json(integration);
    } catch (err) {
      console.error(err);
      return next({ status: 500 });
    }
  }

  static async findOrCreate(
    req: AuthedRequestWithBody<channelFindOrCreateType>,
    res: Response,
    next: NextFunction
  ) {
    const channel = await ChannelsService.findOrCreateChannel({
      ...req.body,
    });
    return res.json(serializeChannel(channel));
  }
}
