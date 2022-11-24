import { findChannelsByAccount } from 'lib/channel';
import { serialize } from 'api/serialize';
import { tenantMiddleware } from 'api/middlewares/tenant';
import { Router, NextFunction, Response } from 'express';
import errorMiddleware from 'api/middlewares/error';

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
    console.error(error);
    next(error);
  }
};

export default Router()
  // routes
  .get('/channels', tenantMiddleware, getChannelsController)
  // not sure why, but at least on tests, this errorMiddleware is needed
  .use('/channels', errorMiddleware);
