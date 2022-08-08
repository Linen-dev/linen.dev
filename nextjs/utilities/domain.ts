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
