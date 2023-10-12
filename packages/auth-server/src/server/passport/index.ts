import passport from 'passport';
import { localStrategy } from './localStrategy';
import { magicLinkStrategy } from './magicLinkStrategy';
import { githubStrategy } from './githubStrategy';

type Props = {
  authorize: (username: string, password: string) => Promise<any>;
  getOrCreateAuthWithEmail: (email: string) => Promise<{
    id: string;
    email: string;
  }>;
  secret: string;
  sendEmail: (args: { to: string; url: string }) => Promise<any>;
  authServerUrl: string;
  githubClientID: string;
  githubClientSecret: string;
};

export default function Passport({
  authorize,
  getOrCreateAuthWithEmail,
  secret,
  sendEmail,
  authServerUrl,
  githubClientID,
  githubClientSecret,
}: Props) {
  passport.use(localStrategy({ authorize }));
  const magicStrategy = magicLinkStrategy({
    getOrCreateAuthWithEmail,
    secret,
    sendEmail,
  });
  passport.use(magicStrategy);

  if (!!githubClientID && !!githubClientSecret) {
    passport.use(
      githubStrategy({
        authServerUrl,
        clientID: githubClientID,
        clientSecret: githubClientSecret,
        getOrCreateAuthWithEmail,
      })
    );
  }

  const loginPassport = passport.authenticate('local', {
    session: false,
    failWithError: true,
  });

  const magicLink = passport.authenticate('magiclogin', {
    session: false,
    failWithError: true,
  });

  const githubSignIn = (state?: string) =>
    !!githubClientID && !!githubClientSecret
      ? passport.authenticate('github', {
          session: false,
          failWithError: true,
          scope: ['user:email'],
          state,
        })
      : () => {};

  return {
    passport,
    loginPassport,
    magicLink,
    githubSignIn,
    magicLinkStrategy: magicStrategy,
  };
}

export { Passport };
