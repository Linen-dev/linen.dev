import { timeoutAfter } from '../../utilities/retryPromises';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createChannels } from 'services/slack';
import request from 'superagent';
import {
  fetchTeamInfo,
  getSlackChannels,
  joinChannel,
} from 'services/slack/api';
import { createSlackAuthorization, updateAccount } from '../../lib/models';
import { captureException, withSentry } from '@sentry/nextjs';
import { createSyncJob } from 'queue/jobs';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.query.error) {
      throw req.query.error;
    }

    const code = req.query.code;
    const accountId = req.query.state as string;
    const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;

    const resp = await getSlackAccessToken(
      code as string,
      clientId as string,
      clientSecret as string
    );

    const body: SlackAuthorizationResponse = resp.body;
    if (!body.ok) {
      throw body;
    }

    const teamInfoResponse = await fetchTeamInfo(body.access_token);
    const communityUrl = teamInfoResponse?.body?.team?.url;

    const account = await updateAccount(accountId, {
      slackTeamId: body.team.id,
      name: body.team.name,
      slackDomain: communityUrl.replace('https://', '').split('.')[0] as string,
      communityUrl,
    });

    const user = body.authed_user;

    await createSlackAuthorization({
      accessToken: body.access_token,
      botUserId: body.bot_user_id,
      scope: body.scope,
      accountsId: account.id,
      userAccessToken: user.access_token,
      userScope: user.scope,
      authedUserId: user.id,
    });

    // this function runs on serverless, implement promise race to avoid timeout for huge communities
    await Promise.race([
      timeoutAfter(5),
      createChannels({
        accountId,
        slackTeamId: body.team.id,
        token: body.access_token,
        getSlackChannels,
        joinChannel,
      }),
    ]);

    await createSyncJob({
      account_id: accountId,
    });

    return res.redirect('/settings');
  } catch (error) {
    console.error({ error });
    captureException(error);
    return res.redirect('/settings?error=1');
  }
}

export const getSlackAccessToken = async (
  code: string,
  clientId: string,
  clientSecret: string
) => {
  const url = 'https://slack.com/api/oauth.v2.access';

  const response = await request.get(
    url +
      '?code=' +
      code +
      '&client_id=' +
      clientId +
      '&client_secret=' +
      clientSecret
  );

  return response;
};

export interface SlackAuthorizationResponse {
  ok: boolean;
  app_id: string;
  authed_user: AuthedUser;
  scope: string;
  token_type: string;
  access_token: string;
  bot_user_id: string;
  team: Team;
  enterprise?: null;
  is_enterprise_install: boolean;
  incoming_webhook: IncomingWebhook;
}
export interface AuthedUser {
  id: string;
  scope: string;
  access_token: string;
  token_type: string;
}
export interface Team {
  id: string;
  name: string;
}
export interface IncomingWebhook {
  channel: string;
  channel_id: string;
  configuration_url: string;
  url: string;
}

export default withSentry(handler);
