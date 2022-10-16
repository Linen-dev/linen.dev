import type { NextApiRequest, NextApiResponse } from 'next';
import { captureException, withSentry } from '@sentry/nextjs';
import Session from 'services/session';
import { Roles } from '@prisma/client';
import { findAuthByEmail } from 'lib/users';
import { getHomeUrl } from 'utilities/home';
import serializeAccount from 'serializers/account';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await Session.find(req, res);
    if (!session?.user?.email) {
      throw 'missing session';
    }

    const auth = await findAuthByEmail(session.user.email);
    if (!auth) {
      throw 'missing auth';
    }

    const account = serializeAccount(
      auth.users.find((u) => u.accountsId === auth.accountId)?.account
    );
    if (!account) {
      return res.redirect('/getting-started').end();
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
