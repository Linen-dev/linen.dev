import { serialize } from 'api/serialize';
import { tenantMiddleware } from 'api/middlewares/tenant';
import { serialize as serializeAccount } from 'serializers/account/settings';
import { Router, NextFunction, Response } from 'express';
import { HttpException } from 'api/exceptions/HttpException';
import errorMiddleware from 'api/middlewares/error';

const getAccountController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.tenant) {
      throw new HttpException(401, 'Account not found');
    }
    const settings = serializeAccount(req.tenant);
    res.json(serialize(settings));
    next();
  } catch (error) {
    next(error);
  }
};

export default Router()
  // routes
  .get('/api/v2/accounts', tenantMiddleware, getAccountController)
  .use(errorMiddleware);
