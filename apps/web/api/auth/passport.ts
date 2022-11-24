import config from 'api/config';
import passport from 'passport';
import passportJWT from 'passport-jwt';
import passportLocal from 'passport-local';
import UsersService from 'services/users';
import { z } from 'zod';

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await UsersService.getUserById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new passportLocal.Strategy(
    { passReqToCallback: true },
    async (req, username, password, done) => {
      try {
        const schema = z.object({
          username: z.string().min(1),
          password: z.string().min(1),
        });
        const userPass = schema.parse({ username, password });

        const user = await UsersService.authorize(
          userPass.username,
          userPass.password
        );
        done(null, user);
      } catch (error) {
        console.error({ error });
        done(error);
      }
    }
  )
);

passport.use(
  new passportJWT.Strategy(
    {
      jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.NEXTAUTH_SECRET,
      passReqToCallback: true,
    },
    async (req: any, jwtPayload: any, done: any) => {
      try {
        const user = await UsersService.getUserById(jwtPayload.data.id);
        req.user = user;
        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

export default passport;
