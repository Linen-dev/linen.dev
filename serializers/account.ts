export enum CommunityType {
  'discord' = 'discord',
  'slack' = 'slack',
}

export interface SerializedAccount {
  id: string;
  homeUrl?: string;
  docsUrl?: string;
  logoUrl?: string;
  redirectDomain?: string;
  brandColor?: string;
  premium: boolean;
  googleAnalyticsId?: string;
  slackSyncStatus: string;
  communityType: CommunityType | null;
  anonymizeUsers?: boolean;
  hasAuth?: boolean;
  slackDomain?: string;
  discordDomain?: string;
  discordServerId?: string;
}

function identifyCommunity(account: any) {
  if (account.slackAuthorizations.length) {
    return CommunityType.slack;
  }
  if (account.discordAuthorizations.length) {
    return CommunityType.discord;
  }
  if (account.discordServerId) {
    return CommunityType.discord;
  }
  if (account.slackTeamId) {
    return CommunityType.slack;
  }
  return null;
}

function hasAuthFn(account: any) {
  if (account.slackAuthorizations.length) {
    return true;
  }
  if (account.discordAuthorizations.length) {
    return true;
  }
  return false;
}

export default function serialize(account?: any): SerializedAccount | null {
  if (!account) {
    return null;
  }
  const {
    homeUrl,
    docsUrl,
    logoUrl,
    redirectDomain,
    brandColor,
    premium,
    googleAnalyticsId,
    slackSyncStatus,
    id,
    anonymizeUsers,
    slackDomain,
    discordDomain,
    discordServerId,
  } = account;

  const communityType = identifyCommunity(account);
  const hasAuth = hasAuthFn(account);

  return {
    homeUrl,
    docsUrl,
    logoUrl,
    redirectDomain,
    brandColor,
    premium,
    googleAnalyticsId,
    slackSyncStatus,
    id,
    communityType,
    anonymizeUsers,
    hasAuth,
    slackDomain,
    discordDomain,
    discordServerId,
  };
}
