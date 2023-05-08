import { Router } from 'express';
import {
  NextFunction,
  Response,
  Request,
  AuthedRequest,
  LoggedUser,
} from '@linen/types';
import csrfMiddleware from './csrf';
import type passport from 'passport';
import { refreshTokenAction, signToken } from '../tokens';
import { expireSessionCookies, setSessionCookies } from '../cookies';
import { createCSRFToken } from '../csrf';
import { qs } from '@linen/utilities/url';
import { encrypt, decrypt } from '../crypto';
import type { Session } from '../../client';
import type MagicLoginStrategy from 'passport-magic-login';

class Unauthorized extends Error {
  public status: number;
  public message: string;

  constructor(status = 401, message = 'Unauthorized') {
    super(message);
    this.status = status;
    this.message = message;
  }
}

type User = {
  state?: string;
  displayName?: string;
  email: string;
  id: string;
  profileImageUrl?: string;
};

type Props = {
  passport: passport.PassportStatic;
  loginPassport: any;
  magicLink: any;
  magicLinkStrategy: MagicLoginStrategy;
  githubSignIn: (state?: string) => any;
  prefix: string;
  onCredentialsLogin: (req: Request, res: Response) => Promise<void>;
  onMagicLinkLogin: (req: Request, res: Response, user: User) => Promise<void>;
  onGithubLogin: (req: Request, res: Response, user: User) => Promise<void>;
  onSignOut: (req: Request, res: Response) => Promise<void>;
  jwtMiddleware: (
    _?: never
  ) => (req: AuthedRequest, res: any, next: NextFunction) => Promise<any>;
  createSsoSession: (userId: string, encryptedToken: string) => Promise<string>;
  getSsoSession: (id: string) => Promise<{
    sessionToken: string;
  }>;
};

const onError = (error: any, req: any, res: any, _: any) => {
  return res.redirect('/500');
};

export function CreateRouter({
  githubSignIn,
  loginPassport,
  magicLink,
  magicLinkStrategy,
  prefix,
  onCredentialsLogin,
  onMagicLinkLogin,
  onGithubLogin,
  onSignOut,
  jwtMiddleware,
  createSsoSession,
  getSsoSession,
}: Props) {
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
      await onCredentialsLogin(req, res);

      if (req.query.sso) {
        const state = await createSsoSession(logged_user.id, encrypt(token));
        res.status(200).json({ state });
        return res.end();
      }

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

      const token = await signToken({
        id: logged_user.id,
        email: logged_user.email,
      });
      // persist cookies for SSR
      setSessionCookies({ token, req, res });
      // ===
      await onMagicLinkLogin(req, res, logged_user);

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
            logged_user.state = parsedState.state;
          }
        }

        const token = await signToken({
          id: logged_user.id,
          email: logged_user.email,
        });
        // persist cookies for SSR
        setSessionCookies({ token, req, res });
        // ===

        await onGithubLogin(req, res, logged_user);

        return res.redirect(callbackUrl);
      }
    )
    .use(`${prefix}/callback/github`, onError);

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
      const { newToken } = await refreshTokenAction(req, res);
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
        token: newToken,
      } as Session);
      res.end();
    }
  );

  authRouter.get(
    `${prefix}/sso`,
    async (req: AuthedRequest, res: Response, next: NextFunction) => {
      if (!req.query.state) {
        return next(new Unauthorized());
      }
      const session = await getSsoSession(req.query.state);
      if (!session) {
        return next(new Unauthorized());
      }
      res.status(200).json({ token: decrypt(session.sessionToken) });
      return res.end();
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
        await onSignOut(req, res);
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

  return authRouter;
}

export default CreateRouter;
