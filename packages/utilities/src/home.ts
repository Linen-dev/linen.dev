import { appendProtocol } from './url';

const getLinenUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://linen.dev';
  } else {
    return `http://localhost:${process.env.PORT || 3000}`;
  }
};

export function getHomeUrl(account?: any): string {
  if (!account) {
    return '/';
  }
  if (account.premium && account.redirectDomain) {
    return `${appendProtocol(account.redirectDomain)}`;
  } else if (account.slackDomain) {
    return `${getLinenUrl()}/s/${account.slackDomain}`;
  } else if (account.discordDomain) {
    return `${getLinenUrl()}/d/${account.discordDomain}`;
  } else if (account.discordServerId) {
    return `${getLinenUrl()}/d/${account.discordServerId}`;
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
