import { NextURL } from 'next/dist/server/web/next-url';
import { isSubdomainbasedRouting } from '@linen/utilities/domain';
import { LINEN_STATIC_CDN } from 'config';

export const getCommunityName = (isProd: boolean, hostname: string | null) => {
  if (isProd) {
    return hostname?.replace(`.linen.dev`, '').replace(`*.linene.dev`, '');
  }
  return hostname?.replace(`.localhost:3000`, '') || '';
};

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
// const PAGES = [
//   '/signup',
//   '/signin',
//   '/forgot-password',
//   '/reset-password',
//   '/verify-request',
// ];
function isTopLevelPathname(pathname: string) {
  return (
    // PAGES.includes(pathname) ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/signin') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/verify-request') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/sitemap') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/pp') ||
    pathname.startsWith('/ph')
  );
}

const cleanLinenHost = (hostname: string) =>
  hostname.indexOf('linen.dev') > -1 ? 'www.linen.dev' : hostname;

export function rewrite({
  hostname,
  pathname,
  url,
}: {
  hostname: string | null;
  pathname: string;
  url: NextURL;
}) {
  function isLocalIpAddress(hostname: string | null) {
    if (!hostname) {
      return false;
    }
    return hostname.startsWith('192.168.1.');
  }
  if (isLocalIpAddress(hostname)) {
    return;
  }

  if (pathname === '/sitemap.xml') {
    return {
      rewrite: `${LINEN_STATIC_CDN}/sitemap/${cleanLinenHost(
        hostname || 'linen.dev'
      )}/sitemap.xml`,
    };
  }
  if (pathname === '/robots.txt') {
    return {
      rewrite: `${LINEN_STATIC_CDN}/sitemap/${cleanLinenHost(
        hostname || 'linen.dev'
      )}/robots.txt`,
    };
  }

  if (!isSubdomainbasedRouting(hostname || '')) {
    return;
  }

  //Community name is the subdomain of the request or the full url if it's a redirect
  const communityName = getCommunityName(IS_PRODUCTION, hostname);

  if (!isTopLevelPathname(pathname) && communityName !== '') {
    url.pathname = `/s/${communityName}${pathname}`;
    url.searchParams.append('customDomain', '1');
    return { rewrite: url.toString() };
  }

  // if (PAGES.includes(pathname) && communityName !== '') {
  //   return { rewrite: `https://linen.dev${pathname}` };
  // }
}
