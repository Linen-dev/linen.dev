import { Router, Response } from 'express';
import { AuthedRequest, AuthedRequestWithBody } from '@linen/types';
import * as notificationService from 'services/notifications';
import jwtMiddleware from 'server/middlewares/jwt';
import validationMiddleware from 'server/middlewares/validation';
import {
  putMarkSchema,
  putMarkType,
  putSettingsSchema,
  putSettingsType,
} from './notifications.types';
import { onError } from 'server/middlewares/error';

const prefix = '/api/notifications';
const notificationsRouter = Router();

notificationsRouter.get(
  `${prefix}`,
  jwtMiddleware(),
  async (req: AuthedRequest, res: Response) => {
    const authId = req.session_user?.id!;
    const data = await notificationService.get({ authId });
    res.json(data);
    res.end();
  }
);

notificationsRouter.put(
  `${prefix}/mark`,
  jwtMiddleware(),
  validationMiddleware(putMarkSchema, 'body'),
  async (req: AuthedRequestWithBody<putMarkType>, res: Response) => {
    const authId = req.session_user?.id!;
    const data = await notificationService.mark({
      authId,
      threadId: req.body.threadId,
    });
    res.json(data);
    res.end();
  }
);

notificationsRouter.get(
  `${prefix}/settings`,
  jwtMiddleware(),
  async (req: AuthedRequest, res: Response) => {
    const authId = req.session_user?.id!;
    const data = await notificationService.getSettings({ authId });
    res.json(data);
    res.end();
  }
);

notificationsRouter.put(
  `${prefix}/settings`,
  jwtMiddleware(),
  validationMiddleware(putSettingsSchema, 'body'),
  async (req: AuthedRequestWithBody<putSettingsType>, res: Response) => {
    const authId = req.session_user?.id!;
    const data = await notificationService.updateSettings({
      authId,
      ...req.body,
    });
    res.json(data);
    res.end();
  }
);
notificationsRouter.use(onError);

export default notificationsRouter;
