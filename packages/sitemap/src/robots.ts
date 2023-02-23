import fs from 'fs/promises';

function createRobotsTxt(domain: string) {
  return `
User-agent: *
Allow: /

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
