import { Router, Request, Response } from 'express';
import * as notificationService from 'services/notifications';
import jwtMiddleware from 'utilities/middlewares/jwt';
import validationMiddleware from 'utilities/middlewares/validation';
import {
  putMarkSchema,
  putMarkType,
  putSettingsSchema,
  putSettingsType,
} from './notifications.types';

const prefix = '/api/notifications';
const notificationsRouter = Router();
notificationsRouter.use(jwtMiddleware());

notificationsRouter.get(`${prefix}`, async (req: any, res: Response) => {
  const authId = req.user.id;
  const data = await notificationService.get({ authId });
  res.json(data);
  res.end();
});

notificationsRouter.put(
  `${prefix}/mark`,
  validationMiddleware(putMarkSchema, 'body'),
  async (req: any, res: Response) => {
    const authId = req.user.id;
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
  async (req: any, res: Response) => {
    const authId = req.user.id;
    const data = await notificationService.getSettings({ authId });
    res.json(data);
    res.end();
  }
);

notificationsRouter.put(
  `${prefix}/settings`,
  validationMiddleware(putSettingsSchema, 'body'),
  async (req: any, res: Response) => {
    const authId = req.user.id;
    const data = await notificationService.updateSettings({
      authId,
      ...req.body,
    });
    res.json(data);
    res.end();
  }
);

export default notificationsRouter;
