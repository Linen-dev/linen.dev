import { Router } from 'express';
import tenantMiddleware, { Roles } from 'server/middlewares/tenant';
import validationMiddleware from 'server/middlewares/validation';
import { Forbidden, NotFound } from 'server/exceptions';
import { integrationMatrix, prisma } from '@linen/database';
import {
  AuthedRequestWithTenantAndBody,
  NextFunction,
  Response,
  matrixGetAllSchema,
  matrixGetAllType,
  matrixPostSchema,
  matrixPostType,
  matrixPutSchema,
  matrixPutType,
  matrixDeleteSchema,
  matrixDeleteType,
  integrationMatrixType,
} from '@linen/types';
import { onError } from 'server/middlewares/error';

const prefix = '/api/config/matrix';

export const matrixRouter = Router();

const serialize = (m: integrationMatrix): integrationMatrixType => {
  return {
    enabled: m.enabled,
    id: m.id,
    matrixUrl: m.matrixUrl,
    createdAt: new Date(m.createdAt).toISOString(),
    updatedAt: m.updatedAt ? new Date(m.updatedAt).toISOString() : null,
  };
};

matrixRouter.get(
  `${prefix}`,
  tenantMiddleware([Roles.ADMIN, Roles.OWNER]),
  validationMiddleware(matrixGetAllSchema),
  async (
    req: AuthedRequestWithTenantAndBody<matrixGetAllType>,
    res: Response,
    next: NextFunction
  ) => {
    const matrix = await prisma.integrationMatrix.findMany({
      where: { accountsId: req.tenant?.id! },
      orderBy: { createdAt: 'asc' },
    });
    res.json(matrix.map(serialize));
  }
);

matrixRouter.post(
  `${prefix}`,
  tenantMiddleware([Roles.ADMIN, Roles.OWNER]),
  validationMiddleware(matrixPostSchema),
  async (
    req: AuthedRequestWithTenantAndBody<matrixPostType>,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = await prisma.integrationMatrix.create({
      select: { id: true },
      data: {
        accountsId: req.tenant?.id!,
        matrixUrl: req.body.matrixUrl,
        enabled: req.body.enabled,
        matrixToken: req.body.matrixToken,
      },
    });
    res.json({ ok: true, id });
  }
);

matrixRouter.put(
  `${prefix}/:id`,
  tenantMiddleware([Roles.ADMIN, Roles.OWNER]),
  validationMiddleware(matrixPutSchema),
  async (
    req: AuthedRequestWithTenantAndBody<matrixPutType>,
    res: Response,
    next: NextFunction
  ) => {
    const matrix = await prisma.integrationMatrix.findUnique({
      where: { id: req.body.id },
    });
    if (!matrix) {
      return next(new NotFound());
    }
    if (matrix.accountsId !== req.tenant?.id!) {
      return next(new Forbidden());
    }
    const { id } = await prisma.integrationMatrix.update({
      select: { id: true },
      data: {
        enabled: req.body.enabled,
      },
      where: {
        id: matrix.id,
      },
    });
    if (req.body.enabled) {
      await prisma.integrationMatrix.updateMany({
        data: {
          enabled: false,
        },
        where: {
          id: { not: matrix.id },
          accountsId: req.tenant?.id!,
        },
      });
    }
    res.json({ ok: true, id });
  }
);

matrixRouter.delete(
  `${prefix}/:id`,
  tenantMiddleware([Roles.ADMIN, Roles.OWNER]),
  validationMiddleware(matrixDeleteSchema),
  async (
    req: AuthedRequestWithTenantAndBody<matrixDeleteType>,
    res: Response,
    next: NextFunction
  ) => {
    const matrix = await prisma.integrationMatrix.findUnique({
      where: { id: req.body.id },
    });
    if (!matrix) {
      return next(new NotFound());
    }
    if (matrix.accountsId !== req.tenant?.id!) {
      return next(new Forbidden());
    }
    const { id } = await prisma.integrationMatrix.delete({
      where: {
        id: matrix.id,
      },
    });
    res.json({ ok: true, id });
  }
);

matrixRouter.use(onError);
