import type { NextApiRequest, NextApiResponse } from 'next';
import request from 'superagent';
import { AccountIntegration, prisma } from '@linen/database';
import { eventNewIntegration } from 'services/events/eventNewIntegration';
import { SerializedAccount } from '@linen/types';
import { getHomeUrl } from 'utilities/home';
import { serializeAccount } from '@linen/serializers/account';
import { getCurrentConfig } from 'config/discord';
import { createIntegrationDiscord } from 'queue/jobs';
import { encrypt } from 'utilities/crypto';

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

    const account = await prisma.accounts.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error('account not found');
    }

    await prisma.$transaction([
      prisma.accounts.update({
        where: { id: account.id },
        data: {
          discordServerId: guild.id,
          integration: AccountIntegration.DISCORD,
        },
      }),
      prisma.discordAuthorizations.deleteMany({
        where: {
          accountsId: account.id,
        },
      }),
      prisma.discordAuthorizations.create({
        data: {
          accountsId: account.id,
          accessToken: encrypt(getCurrentConfig().PRIVATE_TOKEN),
          scope: getCurrentConfig().PRIVATE_SCOPE,
          refreshToken: body.refresh_token,
          expiresAt: new Date(new Date().getTime() + body.expires_in * 1000),
          customBot: true,
        },
      }),
    ]);

    await eventNewIntegration({ accountId });
    await createIntegrationDiscord();

    const url = getHomeUrl(serializeAccount(account) as SerializedAccount);
    return res.redirect(`${url}/configurations`);
  } catch (error) {
    console.error(error);
    const accountId = req.query.state as string;
    const account = await prisma.accounts.findFirst({
      where: {
        id: accountId,
      },
    });
    const url = getHomeUrl(serializeAccount(account) as SerializedAccount);
    return res.redirect(`${url}/configurations?error=1`);
  }
}

export const getDiscordAccessToken = async (code: string) => {
  const redirectUri = getCurrentConfig().PUBLIC_REDIRECT_URI;
  const clientId = getCurrentConfig().PUBLIC_CLIENT_ID;
  const clientSecret = getCurrentConfig().PRIVATE_CLIENT_SECRET;
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
