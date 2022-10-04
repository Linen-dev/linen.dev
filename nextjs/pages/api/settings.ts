import type { NextApiRequest, NextApiResponse } from 'next';
import { captureException, withSentry } from '@sentry/nextjs';
import Session from 'services/session';
import { acceptInvite, getOneInviteByUser } from 'services/invites';
import { Roles } from '@prisma/client';
import { findAuthByEmail } from 'lib/users';
import { getHomeUrl } from 'utilities/home';
import serializeAccount from 'serializers/account';
import { isRedirectToNewOnboardingEnabled } from 'utilities/featureFlags';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await Session.find(req, res);
    if (!session?.user?.email) {
      throw 'missing session';
    }

    const invite = await getOneInviteByUser(session.user.email);
    if (invite) {
      await acceptInvite(invite.id, session.user.email);
    }

    const auth = await findAuthByEmail(session.user.email);
    if (!auth) {
      throw 'missing auth';
    }

    const account = serializeAccount(auth.account);
    if (!account) {
      return res.redirect(
        isRedirectToNewOnboardingEnabled ? '/o/create-community' : '/settings'
      );
    }

    const url = getHomeUrl(account);
    const user = auth.users.find((u) => u.accountsId === auth.accountId);

    if (user && user.role === Roles.MEMBER) {
      return res.redirect(url);
    }
    return res.redirect('/settings');
  } catch (error) {
    console.error({ error });
    captureException(error);
    return res.redirect('/');
  }
}

export default withSentry(handler);
