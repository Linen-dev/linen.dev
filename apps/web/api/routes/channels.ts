import { findChannelsByAccount } from 'lib/channel';
import { serialize } from 'api/serialize';
import { tenantMiddleware } from 'api/middlewares/tenant';
import { Router, NextFunction, Response } from 'express';

const getChannelsController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await findChannelsByAccount({
      account: req.tenant,
      isCrawler: false,
    });
    res.json(serialize(data));
    next();
  } catch (error) {
    next(error);
  }
};

export default Router()
  // routes
  .get('/api/v2/channels', tenantMiddleware, getChannelsController);
