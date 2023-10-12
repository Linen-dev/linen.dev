import { onError } from 'server/middlewares/error';
import { CreateRouter } from '@linen/auth-server/server';
import {
  githubSignIn,
  loginPassport,
  magicLink,
  magicLinkStrategy,
  passport,
} from '../auth';
import { prisma } from '@linen/database';
import { ChatType } from '@linen/types';
import jwtMiddleware from 'server/middlewares/jwt';
import { ApiEvent, trackApiEvent } from 'utilities/ssr-metrics';
import { normalize } from '@linen/utilities/string';
import {
  acceptInvite,
  findInvitesByEmail,
  joinCommunityAfterSignIn,
} from 'services/invites';
import { createSsoSession, getSsoSession } from 'services/sso';
import ThreadsService from 'services/threads';
import MessagesService from 'services/messages';
import to from '@linen/utilities/await-to-js';
import ChannelsService from 'services/channels';

async function acceptInvites(userEmail: string) {
  // accept invites
  const invites = await findInvitesByEmail(userEmail);
  for (const invite of invites) {
    await acceptInvite(invite.id, userEmail).catch(console.error);
  }
}

const prefix = '/api/auth';

const authRouter = CreateRouter({
  prefix,
  githubSignIn,
  jwtMiddleware,
  loginPassport,
  magicLink,
  magicLinkStrategy,
  onCredentialsLogin: async (req, res, user) => {
    await acceptInvites(user.email);
    await trackApiEvent({ req, res }, ApiEvent.sign_in, {
      provider: 'credentials',
    });
  },
  onGithubLogin: async (req, res, user) => {
    await acceptInvites(user.email);
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
    await trackApiEvent({ req, res }, ApiEvent.sign_in, {
      provider: 'github',
    });
  },
  onMagicLinkLogin: async (req, res, payload: any) => {
    const state = payload.state;
    const displayName = normalize(
      payload.displayName || payload.email.split('@').shift() || payload.email
    );
    await acceptInvites(payload.email);
    if (state) {
      const account = await prisma.accounts.findUnique({
        where: { id: state },
      });
      if (account) {
        const user = await joinCommunityAfterSignIn({
          request: req,
          response: res,
          communityId: account.id,
          authId: payload.id,
          displayName,
        });
        if (user && account && account.chat === ChatType.MEMBERS) {
          const { thread, message } = payload;
          const [err, _] = await to(
            ChannelsService.isChannelUsable({
              channelId: thread?.channelId || message?.channelId,
              accountId: account.id,
            })
          );
          if (err) {
            console.error(err);
            return;
          }
          if (thread) {
            await ThreadsService.create({
              ...thread,
              authorId: user.id,
              accountId: account.id,
            });
            await trackApiEvent(
              { req: { ...req, user }, res },
              ApiEvent.magic_link_new_thread
            );
          }
          if (message) {
            await MessagesService.create({
              ...message,
              userId: user.id,
              accountId: account.id,
            });
            await trackApiEvent(
              { req: { ...req, user }, res },
              ApiEvent.magic_link_new_message
            );
          }
        }
      }
    }
    await trackApiEvent({ req, res }, ApiEvent.sign_in, {
      provider: 'magic-link',
    });
  },
  onSignOut: async (req, res) => {
    await trackApiEvent({ req, res }, ApiEvent.sign_out);
  },
  passport,
  createSsoSession,
  getSsoSession,
});
authRouter.use(onError);

export default authRouter;
