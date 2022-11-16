import { accounts } from '@prisma/client';
import { CommunityType } from 'serializers/account';
import { links } from '../../constants/examples';

export type Settings = {
  communityId: string;
  communityType: CommunityType;
  googleAnalyticsId?: string | undefined;
  googleSiteVerification?: string | undefined;
  name: string | null;
  brandColor: string;
  homeUrl: string;
  docsUrl: string;
  logoUrl: string;
  communityUrl: string;
  communityInviteUrl: string;
  communityName: string;
  redirectDomain?: string;
  prefix?: 'd' | 's';
};

function buildInviteUrl(account: accounts, communityType: CommunityType) {
  if (account.communityInviteUrl) {
    return account.communityInviteUrl;
  }
  if (communityType === CommunityType.discord) {
    return `https://discord.com/channels/${account.discordServerId}`;
  }
  if (communityType === CommunityType.slack) {
    return `https://${account.slackDomain}.slack.com`;
  }
  return '';
}

export const communityMapping: Record<string, 'd' | 's'> = {
  discord: 'd',
  slack: 's',
  linen: 's',
};

function getCommunityType(account: accounts) {
  if (account.discordServerId) return CommunityType.discord;
  if (account.slackTeamId) return CommunityType.slack;
  else return CommunityType.linen;
}

export function serialize(account: accounts): Settings {
  const defaultSettings =
    links.find(({ accountId }) => accountId === account.id) || links[0];

  const communityType = getCommunityType(account);

  return {
    communityId: account.id,
    prefix: communityMapping[communityType],
    ...(account.redirectDomain && { redirectDomain: account.redirectDomain }),
    communityUrl: account.communityUrl || '',
    communityInviteUrl: buildInviteUrl(account, communityType),
    communityName:
      account.slackDomain ||
      account.discordDomain ||
      account.discordServerId ||
      '',
    name: account.name,
    brandColor: account.brandColor || defaultSettings.brandColor,
    homeUrl: account.homeUrl || defaultSettings.homeUrl,
    docsUrl: account.docsUrl || defaultSettings.docsUrl,
    logoUrl: account.logoUrl || defaultSettings.logoUrl,
    ...(account.premium &&
      account.googleAnalyticsId && {
        googleAnalyticsId: account.googleAnalyticsId,
      }),
    communityType: communityType,
    ...(!!account.googleSiteVerification && {
      googleSiteVerification: account.googleSiteVerification,
    }),
  };
}

export default serialize;
