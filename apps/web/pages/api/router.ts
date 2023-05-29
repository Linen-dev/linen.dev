import type { NextApiRequest, NextApiResponse } from 'next';
import Session from 'services/session';
import { prisma } from '@linen/database';
import { Roles } from '@linen/types';
import { findAuthByEmail } from 'services/users';
import { getHomeUrl } from '@linen/utilities/home';
import { serializeAccount } from '@linen/serializers/account';
import { acceptInvite, findInvitesByEmail } from 'services/invites';

async function handler(request: NextApiRequest, response: NextApiResponse) {
  try {
    const session = await Session.find(request, response);
    if (!session?.user?.email) {
      throw 'missing session';
    }

    // accept invites
    const invites = await findInvitesByEmail(session.user.email);
    for (const invite of invites) {
      await acceptInvite(invite.id, session.user.email).catch(console.error);
    }

    const auth = await findAuthByEmail(session.user.email);
    if (!auth) {
      throw 'missing auth';
    }

    if (!auth?.users?.length) {
      if (process.env.NODE_ENV === 'development') {
        return response.redirect('http://localhost:3000/getting-started');
      }
      return response.redirect('https://linen.dev/getting-started');
    }

    // these only works if the user browse the community before sign-in
    const { communityId, channelId, page } = request.query as {
      communityId: string;
      channelId?: string;
      page: string;
    };

    const user = auth.users.find(
      (u) => u.accountsId === (communityId || auth.accountId)
    );

    if (!user?.account) {
      return response.redirect('/');
    }

    const account = serializeAccount(user.account);

    const url = getHomeUrl(account);

    if (account.id === communityId) {
      if (channelId) {
        const channel = await prisma.channels.findFirst({
          where: {
            id: channelId,
            accountId: account.id,
          },
        });
        if (channel) {
          return response.redirect(`${url}/c/${channel.channelName}`);
        }
      }
      if (page === 'inbox' || page === 'metrics') {
        return response.redirect(`${url}/${page}`);
      }
    }

    if (user && user.role === Roles.MEMBER) {
      return response.redirect(url);
    }

    return response.redirect(`${url}/configurations`);
  } catch (error) {
    console.error(error);
    return response.redirect('/');
  }
}

export default handler;
