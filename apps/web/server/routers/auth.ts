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
  githubSignIn,
  loginPassport,
  magicLink,
  magicLinkStrategy,
} from 'utilities/auth/passport';
import { refreshTokenAction, signToken } from 'utilities/auth/server/tokens';
import {
  expireSessionCookies,
  setSessionCookies,
} from 'utilities/auth/server/cookies';
import { joinCommunityAfterSignIn } from 'services/invites';
import { createCSRFToken } from 'utilities/auth/server/csrf';
import { qs } from '@linen/utilities/url';
import jwtMiddleware from 'server/middlewares/jwt';
import { SessionType } from 'services/session';
import { Unauthorized } from 'server/exceptions';
import { onError, onGetError } from 'server/middlewares/error';
import { encrypt, decrypt } from 'utilities/crypto';
import { normalize } from '@linen/utilities/string';
import { ApiEvent, trackApiEvent } from 'utilities/ssr-metrics';

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
    await trackApiEvent({ req, res }, ApiEvent.sign_in, {
      provider: 'credentials',
    });

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
    await trackApiEvent({ req, res }, ApiEvent.sign_in, {
      provider: 'magic-link',
    });

    const callbackUrl = logged_user.callbackUrl;
    const state = logged_user.state;
    const displayName = normalize(logged_user.displayName || logged_user.email);

    if (state) {
      // join community
      await joinCommunityAfterSignIn({
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

authRouter
  .get(
    `${prefix}/callback/github`,
    async function (req, res, next) {
      // github code
      const code = req.query.code;

      // we may redirect to the origin
      const state = req.query.state;

      if (typeof state === 'string') {
        const decryptedState = decrypt(state);
        const parsedState = JSON.parse(decryptedState);

        if (parsedState.origin) {
          // delete origin from state
          const state = JSON.stringify({
            callbackUrl: parsedState.callbackUrl,
            state: parsedState.state,
          });
          const encryptedState = encrypt(state);
          // redirect
          return res.redirect(
            `${parsedState.origin}${prefix}/callback/github?${qs({
              code,
              state: encryptedState,
            })}`
          );
        }
      }
      next();
    },
    githubSignIn(),
    async function (req, res) {
      if (!req.user) {
        return res.redirect('/500');
      }

      await trackApiEvent({ req, res }, ApiEvent.sign_in, {
        provider: 'github',
      });

      let callbackUrl = '/'; // page redirect

      const logged_user = req.user as LoggedUser;

      const state = req.query.state;
      if (typeof state === 'string') {
        const decryptedState = decrypt(state);
        const parsedState = JSON.parse(decryptedState);
        if (parsedState.callbackUrl) {
          callbackUrl = parsedState.callbackUrl;
        }

        if (parsedState.state) {
          // join community
          await joinCommunityAfterSignIn({
            request: req,
            response: res,
            communityId: parsedState.state,
            authId: logged_user.id,
            displayName: normalize(
              logged_user.displayName ||
                logged_user.email.split('@').shift() ||
                logged_user.email
            ),
            profileImageUrl: logged_user.profileImageUrl,
          });
        }
      }

      const token = await signToken({
        id: logged_user.id,
        email: logged_user.email,
      });
      // persist cookies for SSR
      setSessionCookies({ token, req, res });
      // ===
      return res.redirect(callbackUrl);
    }
  )
  .use(`${prefix}/callback/github`, onGetError);

authRouter.get(`${prefix}/csrf`, async (req: Request, res: Response) => {
  const csrfToken = createCSRFToken();
  res.json({ csrfToken });
});

authRouter.post(
  `${prefix}/magic-link`,
  csrfMiddleware(),
  magicLinkStrategy.send
);

authRouter.get(
  `${prefix}/github`,
  async (req: Request, res: Response, next: NextFunction) => {
    const state = JSON.stringify({
      callbackUrl: req.query.callbackUrl,
      state: req.query.state,
      origin: req.query.origin,
    });
    const encryptedState = encrypt(state);
    return githubSignIn(encryptedState)(req, res, next);
  }
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
      await trackApiEvent({ req, res }, ApiEvent.sign_out);
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

authRouter.use(onError);

export default authRouter;
