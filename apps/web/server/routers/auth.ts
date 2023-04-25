import { onError } from 'server/middlewares/error';
import { CreateRouter } from '@linen/auth/server';
import {
  githubSignIn,
  loginPassport,
  magicLink,
  magicLinkStrategy,
  passport,
} from '../auth';
import jwtMiddleware from 'server/middlewares/jwt';
import { ApiEvent, trackApiEvent } from 'utilities/ssr-metrics';
import { normalize } from '@linen/utilities/string';
import { joinCommunityAfterSignIn } from 'services/invites';

const prefix = '/api/auth';

const authRouter = CreateRouter({
  prefix,
  githubSignIn,
  jwtMiddleware,
  loginPassport,
  magicLink,
  magicLinkStrategy,
  onCredentialsLogin: async (req, res) => {
    await trackApiEvent({ req, res }, ApiEvent.sign_in, {
      provider: 'credentials',
    });
  },
  onGithubLogin: async (req, res, user) => {
    await trackApiEvent({ req, res }, ApiEvent.sign_in, {
      provider: 'github',
    });
    if (user.state) {
      // join community
      await joinCommunityAfterSignIn({
        request: req,
        response: res,
        communityId: user.state,
        authId: user.id,
        displayName: normalize(
          user.displayName || user.email.split('@').shift() || user.email
        ),
        profileImageUrl: user.profileImageUrl,
      });
    }
  },
  onMagicLinkLogin: async (req, res, user) => {
    await trackApiEvent({ req, res }, ApiEvent.sign_in, {
      provider: 'magic-link',
    });
    const state = user.state;
    const displayName = normalize(user.displayName || user.email);

    if (state) {
      // join community
      await joinCommunityAfterSignIn({
        request: req,
        response: res,
        communityId: state,
        authId: user.id,
        displayName,
      });
    }
  },
  onSignOut: async (req, res) => {
    await trackApiEvent({ req, res }, ApiEvent.sign_out);
  },
  passport,
});
authRouter.use(onError);

export default authRouter;
