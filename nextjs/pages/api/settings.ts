import type { NextApiRequest, NextApiResponse } from 'next';
import { captureException, withSentry } from '@sentry/nextjs';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { acceptInvite, getOneInviteByUser } from 'services/invites';
import { Roles } from '@prisma/client';
import { findAuthByEmail } from 'lib/users';
import { getHomeUrl } from 'utilities/home';
import serializeAccount from 'serializers/account';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      throw 'missing session';
    }

    const invite = await getOneInviteByUser(session.user.email);
    const user = invite
      ? await acceptInvite(invite.id, session.user.email)
      : await findAuthByEmail(session.user.email);

    if (user?.role === Roles.MEMBER) {
      const account = serializeAccount(user.account);
      if (!account) throw 'account not found';

      const url = getHomeUrl(account);
      return res.redirect(url);
    }
    return res.redirect('/settings');
  } catch (error) {
    captureException(error);
    return res.redirect('https://linen.dev');
  }
}

export default withSentry(handler);
