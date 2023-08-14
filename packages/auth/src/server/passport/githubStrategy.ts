import GitHubStrategy from 'passport-github2';

type Props = {
  getOrCreateAuthWithEmail: (
    email: string
  ) => Promise<{ id: string; email: string }>;
  clientID: string;
  clientSecret: string;
  authServerUrl: string;
};

export function githubStrategy({
  getOrCreateAuthWithEmail,
  clientID,
  clientSecret,
  authServerUrl,
}: Props) {
  return new GitHubStrategy.Strategy(
    {
      clientID,
      clientSecret,
      callbackURL: `${authServerUrl}/api/auth/callback/github`,
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

        const auth = await getOrCreateAuthWithEmail(user.email);

        return cb(null, {
          ...user,
          id: auth.id,
          email: auth.email,
        });
      } catch (error: any) {
        console.log('error %j', error);
      }

      return cb(null, null);
    }
  );
}
