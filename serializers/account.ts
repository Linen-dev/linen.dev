export interface SerializedAccount {
  id: string;
  homeUrl?: string;
  docsUrl?: string;
  redirectDomain?: string;
  brandColor?: string;
  premium: boolean;
  googleAnalyticsId?: string;
  slackSyncStatus: string;
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
  return {
    homeUrl,
    docsUrl,
    redirectDomain,
    brandColor,
    premium,
    googleAnalyticsId,
    slackSyncStatus,
    id,
  };
}
