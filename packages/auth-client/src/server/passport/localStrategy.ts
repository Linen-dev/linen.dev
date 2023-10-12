import passportLocal from 'passport-local';
import { z } from 'zod';
import { CredentialsSignin } from './CredentialsSigninException';

type Props = {
  authorize: (username: string, password: string) => Promise<any>;
};

export function localStrategy({ authorize }: Props) {
  return new passportLocal.Strategy(
    { passReqToCallback: true },
    async (req, username, password, done) => {
      try {
        const schema = z.object({
          username: z.string().min(1),
          password: z.string().min(1),
        });
        const userPass = schema.parse({ username, password });

        const user = await authorize(userPass.username, userPass.password);

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
}
