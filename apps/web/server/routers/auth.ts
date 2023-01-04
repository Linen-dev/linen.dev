import { Router } from 'express';
import {
  NextFunction,
  Response,
  Request,
  AuthedRequest,
  LoggedUser,
} from 'server/types';
import csrfMiddleware from 'server/middlewares/csrf';
import {
  loginPassport,
  magicLink,
  magicLinkStrategy,
} from 'utilities/auth/passport';
import { refreshTokenAction, signToken } from 'utilities/auth/server/tokens';
import {
  expireSessionCookies,
  setSessionCookies,
} from 'utilities/auth/server/cookies';
import { joinAfterMagicLinkSignIn } from 'services/invites';
import { createCSRFToken } from 'utilities/auth/server/csrf';
import { qs } from 'utilities/url';
import jwtMiddleware from 'server/middlewares/jwt';
import { SessionType } from 'services/session';
import { Unauthorized } from 'server/exceptions';
import { onError } from 'server/middlewares/error';

const prefix = '/api/auth';
const authRouter = Router();

authRouter.post(
  `${prefix}/callback/credentials`,
  csrfMiddleware(),
  loginPassport,
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new Unauthorized());
    }
    const logged_user = req.user as LoggedUser;

    const token = await signToken({
      id: logged_user.id,
      email: logged_user.email,
    });
    // persist cookies for SSR
    setSessionCookies({ token, req, res });
    // ===
    res.status(200).json({ token });
  }
);

authRouter.get(
  `${prefix}/callback/magic-link`,
  magicLink,
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.redirect('/500');
    }
    const logged_user = req.user as LoggedUser;

    const callbackUrl = logged_user.callbackUrl;
    const state = logged_user.state;
    const displayName = logged_user.displayName || logged_user.email;

    if (state) {
      // join community
      await joinAfterMagicLinkSignIn({
        request: req,
        response: res,
        communityId: state,
        authId: logged_user.id,
        displayName,
      });
    }

    const token = await signToken({
      id: logged_user.id,
      email: logged_user.email,
    });
    // persist cookies for SSR
    setSessionCookies({ token, req, res });
    // ===
    res.redirect(callbackUrl || '/');
  }
);

authRouter.get(`${prefix}/csrf`, async (req: Request, res: Response) => {
  const csrfToken = createCSRFToken();
  res.json({ csrfToken });
});

authRouter.post(
  `${prefix}/magic-link`,
  csrfMiddleware(),
  magicLinkStrategy.send
);

authRouter.get(`${prefix}/providers`, async (req: Request, res: Response) => {
  res.status(200).json({
    // email: { type: 'email' },
    credentials: { type: 'credentials' },
  });
});

authRouter.get(
  `${prefix}/session`,
  jwtMiddleware(),
  async (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.session_user) {
      return next(new Unauthorized());
    }
    await refreshTokenAction(req, res);
    const user = {
      ...req.session_user.users?.find((e: any) => e),
      ...req.session_user,
    };
    res.status(200).json({
      user: {
        email: user.email,
        id: user.id,
        name: user?.displayName,
        image: user?.profileImageUrl,
      },
      ...(user?.exp && {
        expires: new Date(user?.exp * 1000).toISOString(),
      }),
    } as SessionType);
    res.end();
  }
);

authRouter.get(`${prefix}/signin`, async (req: Request, res: Response) => {
  const callbackUrl = req.query.callbackUrl;
  res.redirect('/signin?' + qs({ callbackUrl }));
});

authRouter.post(
  `${prefix}/signout`,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      expireSessionCookies({ req, res });
      res.status(200).json({});
    } catch (error) {
      next(error);
    }
  }
);

authRouter.post(
  `${prefix}/token`,
  jwtMiddleware(),
  csrfMiddleware(),
  async (req: Request, res: Response) => {
    const { newToken } = await refreshTokenAction(req, res);
    res.json({ token: newToken });
  }
);

export default authRouter.use(onError);
