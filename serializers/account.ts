export enum CommunityType {
  'discord' = 'discord',
  'slack' = 'slack',
}

export interface SerializedAccount {
  id: string;
  homeUrl?: string;
  docsUrl?: string;
  redirectDomain?: string;
  brandColor?: string;
  premium: boolean;
  googleAnalyticsId?: string;
  slackSyncStatus: string;
  communityType: CommunityType;
}

export default function serialize(account?: any): SerializedAccount | null {
  if (!account) {
    return null;
  }
  const {
    homeUrl,
    docsUrl,
    redirectDomain,
    brandColor,
    premium,
    googleAnalyticsId,
    slackSyncStatus,
    id,
  } = account;

  const communityType = account.discordServerId
    ? CommunityType.discord
    : CommunityType.slack;

  return {
    homeUrl,
    docsUrl,
    redirectDomain,
    brandColor,
    premium,
    googleAnalyticsId,
    slackSyncStatus,
    id,
    communityType,
  };
}
