import { Router, NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import {
  verifyRefresh,
  buildRefreshToken,
  verifyExpiredToken,
  signToken,
  type JwtPayload,
} from 'api/auth/tokens';
import jwtMiddleware from 'api/middlewares/jwt';
import loginPassport from 'api/middlewares/login';

const loginAction = (req: any, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new Error('Login Failed'));
  }
  req.login(req.user, { session: false }, next);
};

const loginController = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = await signToken(req.user);
    const refreshToken = await buildRefreshToken(req.user);
    res.status(200).json({ token, refreshToken });
  } catch (error) {
    next(error);
  }
};

const logoutController = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    req.logOut({ keepSessionInfo: false }, next);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

const tokenController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // TODO: move to middleware
    const postSchema = z.object({
      refreshToken: z.string().min(1),
    });
    const { refreshToken } = postSchema.parse(req.body);
    // --
    const isValid = verifyRefresh(refreshToken) as JwtPayload;
    const token = verifyExpiredToken(req) as JwtPayload | null;
    if (token?.data.id !== isValid.data.id) {
      throw new Error('Wrong user');
    }
    // TODO: we need to have a black list of used tokens
    const newToken = await signToken({ ...isValid.data });
    const newRefreshToken = await buildRefreshToken({ ...isValid.data });
    res.json({ token: newToken, refreshToken: newRefreshToken });
  } catch (error) {
    next(error);
  }
};

const meController = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    next(error);
  }
};

export default Router()
  .post('/api/v2/login', loginPassport, loginAction, loginController)
  .post('/api/v2/logout', logoutController)
  .post('/api/v2/token', tokenController)
  .get('/api/v2/me', jwtMiddleware, meController);
