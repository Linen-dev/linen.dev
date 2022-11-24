import passport from 'passport';

const jwtMiddleware = passport.authenticate('jwt', {
  session: false,
  failWithError: true,
});

export default jwtMiddleware;
