import { accounts, MessagesViewType } from '@prisma/client';
import { links } from '../../constants/examples';

export type Settings = {
  communityId: string;
  communityType: string;
  googleAnalyticsId?: string | undefined;
  googleSiteVerification?: string | undefined;
  name: string | null;
  brandColor: string;
  homeUrl: string;
  docsUrl: string;
  logoUrl: string;
  messagesViewType: MessagesViewType;
  communityUrl: string;
  communityInviteUrl: string;
  communityName: string;
  redirectDomain?: string;
  prefix?: 'd' | 's';
};

function buildInviteUrl(account: accounts) {
  if (account.communityInviteUrl) {
    return account.communityInviteUrl;
  } else if (account.discordServerId) {
    return `https://discord.com/channels/${account.discordServerId}`;
  } else {
    return '';
  }
}

const communityMapping: Record<string, 'd' | 's'> = {
  discord: 'd',
  slack: 's',
};

export function serialize(account: accounts): Settings {
  const defaultSettings =
    links.find(({ accountId }) => accountId === account.id) || links[0];

  const communityType = account.discordServerId ? 'discord' : 'slack';

  return {
    communityId: account.id,
    prefix: communityMapping[communityType],
    ...(account.redirectDomain && { redirectDomain: account.redirectDomain }),
    communityUrl: account.communityUrl || '',
    communityInviteUrl: buildInviteUrl(account),
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
    messagesViewType: account.messagesViewType || MessagesViewType.THREADS,
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
