import { BaseController } from 'server/routers/integrations/base-controller';
import { AuthedRequestWithBody, NextFunction, Response } from 'server/types';
import { channelGetType } from '@linen/types';
import ChannelsService from 'services/channels';
import { BadRequest } from 'server/exceptions';

export class ChannelsController extends BaseController {
  static async get(
    req: AuthedRequestWithBody<channelGetType>,
    res: Response,
    next: NextFunction
  ) {
    if (!!req.body.channelId) {
      const channel = await ChannelsService.findById(req.body.channelId);
      return res.json(channel);
    }

    if (!!req.body.installationId) {
      const channel = await ChannelsService.findByExternalIntegrationId(
        req.body.installationId
      );
      return res.json(channel);
    }

    next(new BadRequest());
  }
}
