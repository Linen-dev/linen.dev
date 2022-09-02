export enum AccountType {
  'PUBLIC' = 'PUBLIC',
  'PRIVATE' = 'PRIVATE',
}

export enum CommunityType {
  'discord' = 'discord',
  'slack' = 'slack',
}

export interface SerializedAccount {
  id: string;
  type: AccountType;
  homeUrl?: string;
  docsUrl?: string;
  logoUrl?: string;
  redirectDomain?: string;
  brandColor?: string;
  premium: boolean;
  googleAnalyticsId?: string;
  syncStatus: string;
  communityType: CommunityType | null;
  anonymizeUsers?: boolean;
  hasAuth?: boolean;
  slackDomain?: string;
  discordDomain?: string;
  discordServerId?: string;
  communityInviteUrl?: string;
}

function identifyCommunity(account: any) {
  if (account.slackAuthorizations?.length) {
    return CommunityType.slack;
  }
  if (account.discordAuthorizations?.length) {
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
  if (account.slackAuthorizations?.length) {
    return true;
  }
  if (account.discordAuthorizations?.length) {
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
    syncStatus,
    id,
    type,
    anonymizeUsers,
    slackDomain,
    discordDomain,
    discordServerId,
    communityInviteUrl,
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
    syncStatus,
    id,
    type: type || AccountType.PUBLIC,
    communityType,
    anonymizeUsers,
    hasAuth,
    slackDomain,
    discordDomain,
    discordServerId,
    communityInviteUrl,
  };
}
