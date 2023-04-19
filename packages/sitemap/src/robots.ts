import fs from 'fs/promises';

function createRobotsTxt(domain: string) {
  return `
User-agent: *
Allow: /

# metrics
Disallow: /ph
Disallow: /pp

# user only pages
Disallow: /api
Disallow: /all
Disallow: /branding
Disallow: /configurations
Disallow: /inbox
Disallow: /members
Disallow: /metrics
Disallow: /plans
Disallow: /starred

# Block files ending in .json, _buildManifest.js, _middlewareManifest.js, _ssgManifest.js, and any other JS files
Disallow: /*.json$
Disallow: /*_buildManifest.js$
Disallow: /*_middlewareManifest.js$
Disallow: /*_ssgManifest.js$
Disallow: /*.js$

Sitemap: https://${domain}/sitemap.xml
`.trim();
}

export async function buildRobots(
  redirectDomain: string | null,
  workDir: string
) {
  if (redirectDomain) {
    await fs.writeFile(
      `${workDir}/sitemap/${redirectDomain}/robots.txt`,
      createRobotsTxt(redirectDomain)
    );
  }
}
