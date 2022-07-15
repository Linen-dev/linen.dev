export function getDomain(hostname: string): string {
  return hostname.split('.').slice(-1)[0];
}

export function getSubdomain(hostname: string): string | null {
  return hostname.includes('.') ? hostname.split('.')[0] : null;
}

const linenHostname = [
  'localhost',
  'localhost:3000',
  'linen.dev',
  'ngrok.io',
  'vercel.app',
];

export function isLinenDomain(host?: string) {
  if (!host) return true;
  return !!linenHostname.find(
    (linenHost) => linenHost === host || host.endsWith(linenHost)
  );
}

export function cleanUpDomain(url: string) {
  try {
    return new URL(url).host;
  } catch (error) {
    return url;
  }
}
