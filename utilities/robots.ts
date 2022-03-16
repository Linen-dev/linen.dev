export function createRobotsTxt(domain) {
  return `
User-agent: *
Allow: /

Sitemap: https://${domain}/sitemap.xml
  `.trimStart();
}

export function createRobotsTxtForSubdomain(domain, subdomain) {
  return `
User-agent: *
Allow: /

Sitemap: https://${subdomain}.${domain}/sitemap.xml
`.trimStart();
}
