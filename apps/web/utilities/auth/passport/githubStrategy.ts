import GitHubStrategy from 'passport-github2';
import UsersService from 'services/users';

export const githubStrategy = new GitHubStrategy.Strategy(
  {
    clientID: process.env.AUTH_GITHUB_ID!,
    clientSecret: process.env.AUTH_GITHUB_SECRET!,
    callbackURL: `${process.env.NEXTAUTH_URL}/api/auth/callback/github`,
    passReqToCallback: true,
    scope: ['user:email'],
  },
  async function (
    req: any,
    accessToken: any,
    refreshToken: any,
    profile: any,
    cb: any
  ) {
    try {
      const user = {
        displayName: profile.displayName || profile.username,
        profileImageUrl: profile.photos?.find(Boolean)?.value,
        email: profile.emails?.find(Boolean)?.value,
      };

      if (!user.email) {
        throw new Error('email not found');
      }

      const auth = await UsersService.getOrCreateUserWithEmail(user.email);

      return cb(null, {
        ...user,
        id: auth.id,
        email: auth.email,
      });
    } catch (error: any) {
      console.log('error %j', error);
    }

    return cb(null, null); // it will fail on controller
  }
);
