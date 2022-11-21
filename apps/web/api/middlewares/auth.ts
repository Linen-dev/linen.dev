import passport from 'api/auth/passport';

export const authMiddleware = passport.authenticate('jwt', { session: false });
