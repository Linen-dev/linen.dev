import passport from 'utilities/auth/passport';

export const magicLink = passport.authenticate('magiclogin', {
  session: false,
  failWithError: true,
});

export default magicLink;
