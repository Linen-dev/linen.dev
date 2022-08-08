import { NextApiRequest } from 'next';

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
