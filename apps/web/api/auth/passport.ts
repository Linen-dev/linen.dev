import passport from 'passport';
import passportJWT from 'passport-jwt';
import passportLocal from 'passport-local';
import jwt from 'jsonwebtoken';
import UsersService from 'services/users';

export const signToken = (user: any) => {
  return jwt.sign({ data: user }, process.env.NEXTAUTH_SECRET!, {
    expiresIn: '10m',
  });
};

export const login = async (req: any, user: any) => {
  return new Promise((resolve, reject) => {
    req.login(user, { session: false }, (err: any) => {
      if (err) {
        return reject(err);
      }
      return resolve(signToken(user));
    });
  });
};

passport.serializeUser((user: any, done) => {
  return done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await UsersService.getUserById(id);
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
});

passport.use(
  new passportLocal.Strategy(
    { passReqToCallback: true },
    async (req, username, password, done) => {
      try {
        const user = await UsersService.authorize(username, password);
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  new passportJWT.Strategy(
    {
      jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    },
    async (req: any, jwtPayload: any, done: any) => {
      try {
        const user = await UsersService.getUserById(jwtPayload.data.id);
        req.user = user;
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;
