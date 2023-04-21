const isProd = () => process.env.NODE_ENV === 'production';

export function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, '');
}

export function normalizeUrl(url: string): string {
  return url.replace(/\.\.(\w+)$/, '.$1');
}

export const appendProtocol = (host: string) =>
  `${isProd() ? 'https' : 'http'}://${host}`;

// TODO: Should handle this on validation/save when creating an account
export const addHttpsToUrl = (url: string) => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return appendProtocol(url);
  }
  return url;
};

/** this function will parse an object into query string params */
export const qs = (params: any) => {
  return Object.entries(params)
    .filter(([key, value]) => !!key && !!value)
    .map(
      ([key, value]) =>
        `${key}=${encodeURIComponent(
          (Array.isArray(value) ? value.join() : value) as string
        )}`
    )
    .join('&');
};

export function cleanUpUrl(reqUrl?: string) {
  if (!reqUrl) return;
  const url = new URL(reqUrl, 'http://fa.ke');
  url.searchParams.delete('customDomain');
  return url.toString().split('http://fa.ke').join('');
}
