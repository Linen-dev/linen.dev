import { accounts } from '@prisma/client';
import { links } from '../../constants/examples';
import { CommunityType, Settings } from '@linen/types';
import { appendProtocol } from 'utilities/url';
import { getLinenUrl } from 'utilities/domain';

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

function getCommunityType(
  account: Pick<accounts, 'slackTeamId' | 'discordServerId'>
) {
  if (account.discordServerId) return CommunityType.discord;
  if (account.slackTeamId) return CommunityType.slack;
  else return CommunityType.linen;
}

function getCommunityName(
  account: Pick<accounts, 'slackDomain' | 'discordDomain' | 'discordServerId'>
) {
  return (
    account.slackDomain ||
    account.discordDomain ||
    account.discordServerId ||
    ''
  );
}

/**
 * free - https://linen.dev/{s,d}/{communityName}
 * premium - https://{redirectDomain}
 */
export function getCommunityUrl(
  account: Pick<
    accounts,
    | 'premium'
    | 'redirectDomain'
    | 'slackTeamId'
    | 'slackDomain'
    | 'discordDomain'
    | 'discordServerId'
  >
) {
  if (account.premium && account.redirectDomain) {
    return appendProtocol(account.redirectDomain);
  }
  const communityType = getCommunityType(account);
  const communityName = getCommunityName(account);
  const linenDomain = getLinenUrl();
  return appendProtocol(
    `${linenDomain}/${communityMapping[communityType]}/${communityName}`
  );
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
    communityName: getCommunityName(account),
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
