import {
  CommunityType,
  SerializedAccount,
  SerializedSearchSettings,
} from '@linen/types';
import { tc } from '@linen/utilities/tc';

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
    featurePreview,
    googleAnalyticsId,
    syncStatus,
    id,
    type,
    name,
    anonymizeUsers,
    anonymize,
    slackDomain,
    discordDomain,
    discordServerId,
    communityInviteUrl,
    chat,
    communityUrl,
    newChannelsConfig,
    redirectDomainPropagate,
    searchSettings,
  } = account;

  const communityType = identifyCommunity(account);
  const hasAuth = hasAuthFn(account);
  const search: SerializedSearchSettings = tc(() => JSON.parse(searchSettings));

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
    featurePreview,
    googleAnalyticsId,
    syncStatus,
    id,
    type,
    name,
    communityType,
    anonymizeUsers,
    anonymize,
    hasAuth,
    slackDomain,
    discordDomain,
    discordServerId,
    communityInviteUrl,
    chat,
    communityUrl,
    newChannelsConfig,
    redirectDomainPropagate,
    search,
  };
}
