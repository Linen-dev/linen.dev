import passport from 'api/auth/passport';

const loginPassport = passport.authenticate('local', {
  session: false,
  failWithError: true,
});

export default loginPassport;
