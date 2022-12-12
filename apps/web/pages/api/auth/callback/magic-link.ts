import nextConnect from 'next-connect';
import { onError, onNoMatch } from 'utilities/middlewares/error';
import { init } from 'utilities/middlewares/init';
import { magicLink } from 'utilities/middlewares/magic-link';
import { signToken } from 'utilities/auth/server/tokens';
import { setSessionCookies } from 'utilities/auth/server/cookies';
import { joinAfterMagicLinkSignIn } from 'services/invites';

const handler = nextConnect({
  onError,
  onNoMatch,
});

handler.use(init);
handler.get(magicLink, async (req: any, res) => {
  const callbackUrl = req.user.callbackUrl;
  const state = req.user.state;
  const displayName = req.user.displayName || req.user.email;

  if (state) {
    // join community
    await joinAfterMagicLinkSignIn({
      request: req,
      response: res,
      communityId: state,
      authId: req.user.id,
      displayName,
    });
  }

  const token = await signToken({
    id: req.user.id,
    email: req.user.email,
  });
  // persist cookies for SSR
  setSessionCookies({ token, req, res });
  // ===
  res.redirect(callbackUrl || '/');
});

export default handler;
