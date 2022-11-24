import { z } from 'zod';
import { prisma } from 'client';
import { getThreads } from 'services/channel';
import { serialize } from 'api/serialize';
import { tenantMiddleware } from 'api/middlewares/tenant';
import { Router, NextFunction, Response } from 'express';
import { NotFound } from 'api/exceptions/HttpException';
import errorMiddleware from 'api/middlewares/error';

const getThreadsController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const getSchema = z.object({
      communityName: z.string().min(1),
      channelName: z.optional(z.string().min(1)),
    });
    const { channelName } = getSchema.parse(req.query);
    // improvement: move this to service
    const where = !!channelName
      ? { accountId: req.tenant.id, channelName }
      : { accountId: req.tenant.id, default: true };

    const channel = await prisma.channels.findFirst({ where });
    if (!channel) {
      throw new NotFound();
    }
    const data = await getThreads(channel.id, req.tenant.anonymizeUsers);
    res.json(serialize(data));
    next();
  } catch (error) {
    next(error);
  }
};

export default Router()
  // routes
  .get(
    '/threads',
    // tenant middleware will check if the account is private
    // plus if the user has access to the account
    tenantMiddleware,
    getThreadsController
  )
  // not sure why, but at least on tests, this errorMiddleware is needed
  .use('/threads', errorMiddleware);
