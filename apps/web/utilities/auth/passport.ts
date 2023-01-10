import passport from 'passport';
import { githubStrategy } from './passport/githubStrategy';
import { googleStrategy } from './passport/googleStrategy';
import { localStrategy } from './passport/localStrategy';
import { magicLinkStrategy } from './passport/magicLinkStrategy';

export const loginPassport = passport.authenticate('local', {
  session: false,
  failWithError: true,
});

export const magicLink = passport.authenticate('magiclogin', {
  session: false,
  failWithError: true,
});

export const githubSignIn = (state?: string) =>
  passport.authenticate('github', {
    session: false,
    failWithError: true,
    scope: ['user:email'],
    state,
  });

export const googleSignIn = (state?: string) =>
  passport.authenticate('google', {
    session: false,
    failWithError: true,
    scope: ['profile', 'email'],
    state,
  });

passport.use(githubStrategy);
passport.use(googleStrategy);
passport.use(localStrategy);
passport.use(magicLinkStrategy);

export default passport;
