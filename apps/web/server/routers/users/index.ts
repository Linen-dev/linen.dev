import { Router } from 'express';
import { onError } from 'server/middlewares/error';
import tenantMiddleware from 'server/middlewares/tenant';
import validationMiddleware from 'server/middlewares/validation';
import { BadRequest, NotImplemented } from 'server/exceptions';
import {
  AuthedRequestWithTenantAndBody,
  NextFunction,
  Response,
} from 'server/types';
import { prisma } from '@linen/database';
import { Roles } from '@linen/types';
import UsersService from 'services/users';
import { z } from 'zod';
import serialize from 'serializers/user';

const prefix = '/api/users';

const usersRouter = Router();

const getUsersSchema = z.object({
  accountId: z.string().uuid(),
});
type getUsersType = z.infer<typeof getUsersSchema>;

usersRouter.get(
  `${prefix}`,
  tenantMiddleware([Roles.ADMIN, Roles.OWNER, Roles.MEMBER]),
  validationMiddleware(getUsersSchema),
  async (
    req: AuthedRequestWithTenantAndBody<getUsersType>,
    res: Response,
    next: NextFunction
  ) => {
    const users = await prisma.users.findMany({
      select: { id: true, displayName: true },
      where: { accountsId: req.tenant?.id!, auth: {} },
    });
    return res.json(users);
  }
);

const putUserSchema = z.object({
  accountId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum([Roles.ADMIN, Roles.MEMBER, Roles.OWNER]),
});
type putUserType = z.infer<typeof putUserSchema>;

usersRouter.put(
  `${prefix}`,
  tenantMiddleware([Roles.ADMIN, Roles.OWNER]),
  validationMiddleware(putUserSchema),
  async (
    req: AuthedRequestWithTenantAndBody<putUserType>,
    res: Response,
    next: NextFunction
  ) => {
    const { userId, role } = req.body;

    const user = await prisma.users.findFirst({
      select: { id: true },
      where: {
        id: userId,
        accountsId: req.tenant?.id!,
      },
    });
    if (!user) {
      return next(new BadRequest('user does not belong to tenant'));
    }

    await UsersService.updateUserRole({ userId, role });
    return res.status(200).json({});
  }
);

usersRouter.all(`${prefix}*`, (_: any, _2: any, next: NextFunction) => {
  next(new NotImplemented());
});

usersRouter.use(onError);

export default usersRouter;
