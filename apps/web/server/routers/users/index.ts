import { Router } from 'express';
import { onError } from 'server/middlewares/error';
import tenantMiddleware from 'server/middlewares/tenant';
import validationMiddleware from 'server/middlewares/validation';
import { BadRequest, NotImplemented } from 'server/exceptions';
import {
  AuthedRequestWithTenantAndBody,
  NextFunction,
  Response,
  Roles,
  deleteUserSchema,
  deleteUserType,
} from '@linen/types';
import { prisma } from '@linen/database';
import UsersService from 'services/users';
import { z } from 'zod';

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

usersRouter.delete(
  `${prefix}`,
  tenantMiddleware([Roles.ADMIN, Roles.OWNER]),
  validationMiddleware(deleteUserSchema),
  async (
    req: AuthedRequestWithTenantAndBody<deleteUserType>,
    res: Response,
    next: NextFunction
  ) => {
    const { userId } = req.body;

    const user = await prisma.users.findUnique({
      where: {
        id: userId,
      },
    });
    if (user && user.accountsId === req.tenant?.id) {
      await prisma.users.update({
        where: { id: user.id },
        data: {
          authsId: null,
          displayName: 'deleted-user',
          profileImageUrl: null,
        },
      });
      return res.status(200).json({});
    }

    const invite = await prisma.invites.findUnique({ where: { id: userId } });
    if (invite && invite.accountsId === req.tenant?.id) {
      await prisma.invites.delete({ where: { id: userId } });
      return res.status(200).json({});
    }

    return next(new BadRequest('user not found'));
  }
);

usersRouter.all(`${prefix}*`, (_: any, _2: any, next: NextFunction) => {
  next(new NotImplemented());
});

usersRouter.use(onError);

export default usersRouter;
