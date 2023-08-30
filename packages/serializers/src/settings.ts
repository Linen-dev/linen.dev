import { accounts } from '@linen/database';
import { ChatType, CommunityType, Settings } from '@linen/types';
import { appendProtocol } from '@linen/utilities/url';
import { getLinenUrl } from '@linen/utilities/domain';

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

export function serializeSettings(account: accounts): Settings {
  const communityType = getCommunityType(account);

  return {
    communityId: account.id,
    prefix: communityMapping[communityType],
    ...(account.redirectDomain && { redirectDomain: account.redirectDomain }),
    communityUrl: account.communityUrl || '',
    communityName: getCommunityName(account),
    name: account.name,
    brandColor: account.brandColor || 'var(--color-navbar)',
    homeUrl: account.homeUrl || 'https://linen.dev',
    docsUrl: account.docsUrl || 'https://linen.dev',
    logoUrl:
      account.logoUrl ||
      'https://static.main.linendev.com/logos/linen-white-logo.svg',
    ...(account.premium &&
      account.googleAnalyticsId && {
        googleAnalyticsId: account.googleAnalyticsId,
      }),
    communityType: communityType,
    ...(!!account.googleSiteVerification && {
      googleSiteVerification: account.googleSiteVerification,
    }),
    chat: (account.chat as ChatType) || null,
  };
}
