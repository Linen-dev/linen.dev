import type { NextApiRequest, NextApiResponse } from 'next';
import request from 'superagent';
import { findOrCreateAccount } from '../../lib/slack';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const code = req.query.code;
  const clientId = process.env.SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET;
  const resp = await getSlackAccessToken(
    code as string,
    clientId,
    clientSecret
  );
  console.log({ body: resp.body });
  const body: SlackAuthorizationResponse = resp.body;
  const accountWithSlackAuthorization = await findOrCreateAccount({
    slackTeamId: body.team.id,
    name: body.team.name,
    slackAuthorization: {
      create: {
        accessToken: body.access_token,
        botUserId: body.bot_user_id,
        scope: body.scope,
      },
    },
  });

  res.status(200).json({ ok: true });
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
