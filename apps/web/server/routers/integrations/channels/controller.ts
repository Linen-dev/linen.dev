import { BaseController } from 'server/routers/integrations/base-controller';
import { AuthedRequestWithBody, NextFunction, Response } from 'server/types';
import {
  channelGetIntegrationType,
  channelGetType,
  channelPutIntegrationType,
} from '@linen/types';
import ChannelsService from 'services/channels';
import { BadRequest, NotFound } from 'server/exceptions';
import { stringify, serialize } from 'superjson';

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
        return res.json(serialize(channel).json);
      }

      if (!!req.body.integrationId) {
        const channel = await ChannelsService.findByExternalIntegrationId(
          req.body.integrationId
        );
        if (!channel) {
          return next(new NotFound());
        }
        return res.json(serialize(channel).json);
      }

      return next(new BadRequest());
    } catch (err) {
      console.error(stringify(err));
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
        return res.json(serialize(integration).json);
      }
      return next(new NotFound());
    } catch (err) {
      console.error(stringify(err));
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
      console.error(stringify(err));
      return next({ status: 500 });
    }
  }
}
