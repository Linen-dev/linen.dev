import type { NextApiRequest, NextApiResponse } from 'next';
import Session from 'services/session';
import prisma from '../../client';
import { Roles } from '@linen/types';
import { findAuthByEmail } from 'lib/users';
import { getHomeUrl } from 'utilities/home';
import serializeAccount from 'serializers/account';

async function handler(request: NextApiRequest, response: NextApiResponse) {
  try {
    const session = await Session.find(request, response);
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
      return response.redirect('/getting-started');
    }

    const url = getHomeUrl(account);
    const user = auth.users.find((u) => u.accountsId === auth.accountId);

    const { communityId, channelId, page } = request.query as {
      communityId: string;
      channelId?: string;
      page: string;
    };

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
      if (page === 'feed' || page === 'metrics') {
        return response.redirect(`${url}/${page}`);
      }
    }

    if (user && user.role === Roles.MEMBER) {
      return response.redirect(url);
    }

    return response.redirect(`${url}/settings`);
  } catch (error) {
    console.error(error);
    return response.redirect('/');
  }
}

export default handler;
