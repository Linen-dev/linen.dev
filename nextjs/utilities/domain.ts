import type { NextApiRequest } from 'next';

const LINEN_HOSTNAMES = [
  'localhost',
  'localhost:3000',
  'linen.dev',
  'ngrok.io',
  'vercel.app',
];

export function isLinenDomain(host?: string) {
  if (!host) return true;
  return !!LINEN_HOSTNAMES.find(
    (linenHost) => linenHost === host || host.endsWith(linenHost)
  );
}

export function getCurrentUrl(request?: NextApiRequest) {
  return (
    process.env.NEXTAUTH_URL ||
    request?.headers?.origin ||
    'http://localhost:3000'
  );
}

// Checks if the routing is subdomain or based on paths
export const isSubdomainbasedRouting = (host: string): boolean => {
  if (host.includes('vercel.app')) {
    return false;
  }
  if (host.includes('www.localhost:3000')) {
    return false;
  }

  if (host.includes('.')) {
    const splitHost = host.split('.');
    if (splitHost[0] === 'www') {
      // for cases where user want to use fully qualified name and not subdomain like www.papercups.io
      if (splitHost[1] !== 'linen') {
        return true;
      }
      return false;
    }
    if (host.includes('localhost:3000')) {
      return true;
    }

    // handle osquery.fleetdm.com and something.linen.dev
    if (host.split('.').length > 2) {
      return true;
    }
  }

  return false;
};

export function isSubdomainNotAllowed(host: string) {
  return (
    host.endsWith('linen.dev') &&
    host.split('.').length > 2 &&
    !host.startsWith('www')
  );
}
