const {
  createXMLSitemapForSubdomain,
  createXMLSitemap,
} = require('../utilities/sitemap');

function getSubdomain(hostname) {
  return hostname.includes('.') ? hostname.split('.')[0] : null;
}

export const getServerSideProps = async ({ req, res }) => {
  const { host } = req.headers;
  const subdomain = getSubdomain(host);

  const sitemap = subdomain
    ? await createXMLSitemapForSubdomain(subdomain)
    : await createXMLSitemap([{ url: '/signup' }]);

  res.setHeader('Content-Type', 'application/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default () => null;
