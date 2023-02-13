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
Allow: /sitemap
Allow: /_next/
Allow: *.css
Allow: *.js

Sitemap: https://${domain}/sitemap.xml
`.trim();
}
