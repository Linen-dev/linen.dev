import passport from 'utilities/auth/passport';

export const loginPassport = passport.authenticate('local', {
  session: false,
  failWithError: true,
});

export default loginPassport;
