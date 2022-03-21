export function createRobotsTxt(domain: string) {
  return `
User-agent: *
Allow: /

Sitemap: https://${domain}/sitemap.xml
  `.trimStart();
}

export function createRobotsTxtForSubdomain(domain: string, subdomain: string) {
  return `
User-agent: *
Allow: /

Sitemap: https://${subdomain}.${domain}/sitemap.xml
`.trimStart();
}
