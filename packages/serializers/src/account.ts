import { CommunityType, SerializedAccount } from '@linen/types';

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

export function serializeAccount(account?: any): SerializedAccount {
  const {
    description,
    homeUrl,
    docsUrl,
    logoUrl,
    logoSquareUrl,
    faviconUrl,
    redirectDomain,
    brandColor,
    premium,
    googleAnalyticsId,
    syncStatus,
    id,
    type,
    name,
    anonymizeUsers,
    slackDomain,
    discordDomain,
    discordServerId,
    communityInviteUrl,
    chat,
    communityUrl,
    newChannelsConfig,
  } = account;

  const communityType = identifyCommunity(account);
  const hasAuth = hasAuthFn(account);

  return {
    description,
    homeUrl,
    docsUrl,
    logoUrl,
    logoSquareUrl,
    faviconUrl,
    redirectDomain,
    brandColor,
    premium,
    googleAnalyticsId,
    syncStatus,
    id,
    type,
    name,
    communityType,
    anonymizeUsers,
    hasAuth,
    slackDomain,
    discordDomain,
    discordServerId,
    communityInviteUrl,
    chat,
    communityUrl,
    newChannelsConfig,
  };
}
