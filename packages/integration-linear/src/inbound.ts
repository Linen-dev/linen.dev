import { Router } from 'express';
import { linenSdk } from './helpers/linen';
import { Actions, Types, Issue, Comment } from './helpers/types';
import { channelsIntegrationType } from '@linen/types';
import { fetchTeams, fetchUser } from './helpers/linear';
import { appendProtocol, qs } from '@linen/utilities/url';
import env from './helpers/config';
import axios from 'axios';
import { getIntegrationUrl } from '@linen/utilities/domain';

const linenHost = appendProtocol(getIntegrationUrl());

const prefix = '/api/bridge/linear';

export const bridgeLinearRouter = Router();
// bridgeLinearRouter.use(bodyParser.json());

bridgeLinearRouter.get(`${prefix}/setup`, async (req, res, next) => {
  const state = req.query.integrationId as string;

  const params = {
    response_type: 'code',
    client_id: env.LINEAR_CLIENT_ID,
    redirect_uri: `${linenHost}${prefix}/callback`,
    state,
    scope: ['read', 'write', 'issues:create', 'comments:create'].join(),
    actor: 'application',
  };

  return res.redirect(`https://linear.app/oauth/authorize?${qs(params)}`);
});

bridgeLinearRouter.get(`${prefix}/callback`, async (req, res, next) => {
  const code = req.query.code;
  const integrationId = req.query.state as string;

  const data = {
    code,
    redirect_uri: `${linenHost}${prefix}/callback`,
    client_id: env.LINEAR_CLIENT_ID,
    client_secret: env.LINEAR_CLIENT_SECRET,
    grant_type: 'authorization_code',
  };

  const response = await axios.post(
    'https://api.linear.app/oauth/token',
    data,
    {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    }
  );

  const { access_token } = response.data as {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string[];
  };

  const teams = await fetchTeams({ accessToken: access_token });

  // persist this
  const integration = await linenSdk.updateChannelIntegration({
    integrationId,
    externalId: teams.length === 1 ? teams[0].id : undefined,
    data: {
      access_token,
      teams,
    },
  });

  return res.redirect(integration?.data?.redirect_after || 'https://linen.dev');
});

bridgeLinearRouter.post(`${prefix}/incoming`, async (req, res, next) => {
  try {
    console.log('%j', req.body);
    await handleRequest(req.body);
    return res.send(200);
  } catch (error) {
    console.error('%j', error);
    return next({ status: 500 });
  }
});

const handlersMap = {
  Issue: {
    create: async (data: Issue) => {
      const channel = await linenSdk.getChannel({
        integrationId: data.teamId,
      });
      if (!channel) {
        throw new Error('channel not found');
      }
      const user = await handleUser(channel, data.creatorId);
      await linenSdk.createNewThread({
        accountId: channel.accountId,
        channelId: channel.id,
        authorId: user.id,
        externalThreadId: data.id,
        body: data.description || data.title,
        title: data.title,
      });
    },
    update: async (data: any) => {
      // TODO
    },
    remove: async (data: any) => {
      // TODO
    },
  },
  Comment: {
    create: async (data: Comment) => {
      const thread = await linenSdk.getThread({
        externalThreadId: data.issueId,
      });
      if (!thread) {
        throw new Error('thread not found');
      }
      const channel = await linenSdk.getChannel({
        channelId: thread.channelId,
      });
      if (!channel) {
        throw new Error('channel not found');
      }
      const user = await handleUser(channel, data.userId);
      await linenSdk.createNewMessage({
        accountId: channel.accountId,
        channelId: channel.id,
        authorId: user.id,
        body: data.body,
        externalMessageId: data.id,
        threadId: thread.id,
      });
    },
    update: async (data: any) => {
      // TODO
    },
    remove: async (data: any) => {
      // TODO
    },
  },
};

async function handleRequest(payload: any) {
  const { data, createdAt, organizationId } = payload;
  const action = payload.action as Actions;
  const type = payload.type as Types;

  if (!data.creatorId && !data.userId) {
    // skip from our bot
    return 'message from bot';
  }

  // call handler
  await handlersMap[type][action](data);
}

async function handleUser(
  channel: { id: string; accountId: string },
  userId: string
) {
  let user = await linenSdk
    .findUser({
      accountsId: channel.accountId,
      externalUserId: userId,
    })
    .catch(console.error);
  if (!user) {
    // create user
    const integration = await linenSdk.getChannelIntegration({
      channelId: channel.id,
      type: channelsIntegrationType.LINEAR,
    });
    if (!integration) {
      throw new Error('integration not found');
    }
    const newUser = await fetchUser({
      accessToken: integration.data.access_token,
      userId: userId,
    });
    if (!newUser) {
      throw new Error('user not found');
    }
    user = await linenSdk.findOrCreateUser({
      accountsId: channel.accountId,
      externalUserId: userId,
      displayName: newUser.displayName,
      profileImageUrl: newUser.avatarUrl,
    });
    if (!user) {
      throw new Error('user not found');
    }
  }
  return user;
}
