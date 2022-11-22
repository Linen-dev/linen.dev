import { SerializedAccount } from '@linen/types';

export function getHomeUrl(account?: SerializedAccount): string {
  if (!account) {
    return '/';
  }
  if (account.premium && account.redirectDomain) {
    return `https://${account.redirectDomain}`;
  } else if (account.slackDomain) {
    return `/s/${account.slackDomain}`;
  } else if (account.discordDomain) {
    return `/d/${account.discordDomain}`;
  } else if (account.discordServerId) {
    return `/d/${account.discordServerId}`;
  }
  return '/';
}

export function getHomeText(url: string): string | null {
  if (url === '/') {
    return null;
  }
  if (url.startsWith('https://')) {
    return url.replace('https://', '');
  }
  return `linen.dev${url}`;
}
