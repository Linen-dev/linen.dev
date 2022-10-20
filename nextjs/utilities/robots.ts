export function createRobotsTxt(domain: string) {
  return `
User-agent: *
Disallow: /

User-agent: *
Allow: /$
Allow: /s/
Allow: /d/
Allow: /t/
Allow: /c/
Disallow: /feed
Allow: /sitemap

Sitemap: https://${domain}/sitemap.xml
`.trim();
}
