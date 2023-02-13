import { BaseController } from 'server/routers/integrations/base-controller';
import { AuthedRequestWithBody, NextFunction, Response } from 'server/types';
import { channelGetType } from '@linen/types';
import ChannelsService from 'services/channels';
import { BadRequest } from 'server/exceptions';
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
        return res.json(serialize(channel).json);
      }

      if (!!req.body.integrationId) {
        const channel = await ChannelsService.findByExternalIntegrationId(
          req.body.integrationId
        );
        return res.json(serialize(channel).json);
      }

      return res.status(400);
    } catch (err) {
      console.error(stringify(err));
      return res.status(500);
    }
  }
}
