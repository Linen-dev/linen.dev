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
  communityType: CommunityType;
  anonymizeUsers?: boolean;
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
  } = account;

  const communityType = account.discordServerId
    ? CommunityType.discord
    : CommunityType.slack;

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
  };
}
