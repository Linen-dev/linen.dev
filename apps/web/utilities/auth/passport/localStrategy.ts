import passportLocal from 'passport-local';
import UsersService from 'services/users';
import { z } from 'zod';
import { CredentialsSignin } from 'server/exceptions';

export const localStrategy = new passportLocal.Strategy(
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

      if (!user) {
        return done(new CredentialsSignin());
      }

      done(null, user);
    } catch (error) {
      console.error({ error });
      done(error);
    }
  }
);
