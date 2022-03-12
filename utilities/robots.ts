import { DOMAIN } from './domain';

export function createRobotsTxt() {
  return `
User-agent: *
Allow: /

Sitemap: https://${DOMAIN}/sitemap.xml
  `.trimStart();
}

export function createRobotsTxtForSubdomain(subdomain) {
  return `
User-agent: *
Allow: /

Sitemap: https://${subdomain}.${DOMAIN}/sitemap.xml
`.trimStart();
}
