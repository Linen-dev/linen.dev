const DOMAIN = process.env.DOMAIN || 'localhost:3000';

function getSubdomain(hostname) {
  return hostname.includes('.') ? hostname.split('.')[0] : null;
}

function createRobotsTxt() {
  return `
User-agent: *
Allow: /

Sitemap: https://${DOMAIN}/sitemap.xml
  `.trimStart();
}

function createRobotsTxtForSubdomain(subdomain) {
  return `
User-agent: *
Allow: /

Sitemap: https://${subdomain}.${DOMAIN}/sitemap.xml
`.trimStart();
}

export const getServerSideProps = async ({ req, res }) => {
  const { host } = req.headers;
  const subdomain = getSubdomain(host);

  // TODO Do we want to verify if the subdomain really exists?

  const robots = subdomain
    ? await createRobotsTxtForSubdomain(subdomain)
    : await createRobotsTxt();

  res.setHeader('Content-Type', 'text/plain');
  res.write(robots);
  res.end();

  return {
    props: {},
  };
};

export default () => null;
