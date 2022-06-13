export function createRobotsTxt(domain: string) {
  return `
User-agent: *

Disallow: /*.json$
Disallow: /*_buildManifest.js$
Disallow: /*_middlewareManifest.js$
Disallow: /*_ssgManifest.js$
Disallow: /*.js$

Allow: /

Sitemap: https://${domain}/sitemap.xml
  `.trim();
}
