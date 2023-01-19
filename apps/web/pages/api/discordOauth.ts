import type { NextApiRequest, NextApiResponse } from 'next';
import request from 'superagent';
import prisma from '../../client';
import { updateAccount } from '../../lib/models';
import { eventNewIntegration } from 'services/events/eventNewIntegration';
import { AccountIntegration, SerializedAccount } from '@linen/types';
import { createSlug } from 'utilities/util';
import { getHomeUrl } from 'utilities/home';
import serializeAccount from 'serializers/account';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const code = req.query.code;
    const accountId = req.query.state as string;

    if (req.query.error || req.query.error_description) {
      throw req.query;
    }

    const resp = await getDiscordAccessToken(code as string);

    const body: DiscordAuthorizationResponse = resp.body;

    const guild = body.guild;

    const account = await updateAccount(accountId, {
      discordServerId: guild.id,
      name: guild.name,
      discordDomain: createSlug(guild.name),
      integration: AccountIntegration.DISCORD,
    });

    await prisma.discordAuthorizations.create({
      data: {
        accountsId: account.id,
        accessToken: body.access_token,
        scope: body.scope,
        refreshToken: body.refresh_token,
        //Expires in returns the seconds until the token expires
        expiresAt: new Date(new Date().getTime() + body.expires_in * 1000),
      },
    });

    await eventNewIntegration({ accountId });

    const url = getHomeUrl(serializeAccount(account) as SerializedAccount);
    return res.redirect(`${url}/integrations`);
  } catch (error) {
    console.error(error);
    const accountId = req.query.state as string;
    const account = await prisma.accounts.findFirst({
      where: {
        id: accountId,
      },
    });
    const url = getHomeUrl(serializeAccount(account) as SerializedAccount);
    return res.redirect(`${url}/integrations?error=1`);
  }
}

export const getDiscordAccessToken = async (code: string) => {
  const redirectUri = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI as string;
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID as string;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET as string;
  const url = 'https://discord.com/api/oauth2/token';
  return await request
    .post(url)
    .type('form')
    .send({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: encodeURI(redirectUri),
    });
};

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

export interface DiscordAuthorizationResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
  guild: Guild;
}

export interface Guild {
  id: string;
  name: string;
  icon: any;
  description: any;
  splash: any;
  discovery_splash: any;
  features: any[];
  emojis: any[];
  stickers: any[];
  banner: any;
  owner_id: string;
  application_id: any;
  region: string;
  afk_channel_id: any;
  afk_timeout: number;
  system_channel_id: string;
  widget_enabled: boolean;
  widget_channel_id: any;
  verification_level: number;
  roles: Role[];
  default_message_notifications: number;
  mfa_level: number;
  explicit_content_filter: number;
  max_presences: any;
  max_members: number;
  max_video_channel_users: number;
  vanity_url_code: any;
  premium_tier: number;
  premium_subscription_count: number;
  system_channel_flags: number;
  preferred_locale: string;
  rules_channel_id: any;
  public_updates_channel_id: any;
  hub_type: any;
  premium_progress_bar_enabled: boolean;
  nsfw: boolean;
  nsfw_level: number;
  embed_enabled: boolean;
  embed_channel_id: any;
}

export interface Role {
  id: string;
  name: string;
  permissions: number;
  position: number;
  color: number;
  hoist: boolean;
  managed: boolean;
  mentionable: boolean;
  icon: any;
  unicode_emoji: any;
  flags: number;
  permissions_new: string;
  tags?: Tags;
}

export interface Tags {
  bot_id: string;
}

export default handler;
