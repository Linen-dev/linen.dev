import { AccountIntegration, prisma } from '@linen/database';
import * as integration from 'services/events/eventNewIntegration';
import * as jobs from 'queue/jobs';
import * as discord from 'services/discord/getDiscordAccessToken';
import { SerializedAccount } from '@linen/types';
import { getHomeUrl } from '@linen/utilities/home';
import { serializeAccount } from '@linen/serializers/account';
import { getCurrentConfig } from 'config/discord';
import { encrypt } from 'utilities/crypto';

export async function newDiscordIntegration({
  query,
  getDiscordAccessToken = discord.getDiscordAccessToken,
  eventNewIntegration = integration.eventNewIntegration,
  createIntegrationDiscord = jobs.createIntegrationDiscord,
}: {
  query: any;
  getDiscordAccessToken?(code: string): Promise<{ body: any }>;
  eventNewIntegration?(event: integration.NewMessageEvent): Promise<void>;
  createIntegrationDiscord?(): Promise<any>;
}) {
  const code = query.code;
  const accountId = query.state;

  const account = await prisma.accounts.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    return 'https://www.linen.dev/500?error=account-not-found';
  }

  const url = getHomeUrl(serializeAccount(account) as SerializedAccount);

  try {
    if (query.error || query.error_description) {
      throw query;
    }

    const resp = await getDiscordAccessToken(code);

    const body: DiscordAuthorizationResponse = resp.body;

    const guild = body.guild;

    await prisma.accounts.update({
      where: { id: account.id },
      data: {
        discordServerId: guild.id,
        integration: AccountIntegration.DISCORD,
      },
    });

    const auths = await prisma.discordAuthorizations.findFirst({
      where: { accountsId: account.id },
      orderBy: { createdAt: 'desc' },
    });
    if (auths) {
      await prisma.discordAuthorizations.update({
        data: {
          accessToken: encrypt(getCurrentConfig().PRIVATE_TOKEN),
          scope: getCurrentConfig().PRIVATE_SCOPE,
          refreshToken: body.refresh_token,
          expiresAt: new Date(new Date().getTime() + body.expires_in * 1000),
          customBot: true,
        },
        where: { id: auths.id },
      });
      await prisma.discordAuthorizations.deleteMany({
        where: {
          accountsId: account.id,
          id: { not: auths.id },
        },
      });
    } else {
      await prisma.discordAuthorizations.create({
        data: {
          accountsId: account.id,
          accessToken: encrypt(getCurrentConfig().PRIVATE_TOKEN),
          scope: getCurrentConfig().PRIVATE_SCOPE,
          refreshToken: body.refresh_token,
          expiresAt: new Date(new Date().getTime() + body.expires_in * 1000),
          customBot: true,
        },
      });
    }

    await eventNewIntegration({ accountId });
    await createIntegrationDiscord();

    return `${url}/configurations`;
  } catch (error) {
    console.error(error);
    return `${url}/configurations?error=1`;
  }
}

interface DiscordAuthorizationResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
  guild: {
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
    roles: {
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
      tags?: {
        bot_id: string;
      };
    }[];
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
  };
}
