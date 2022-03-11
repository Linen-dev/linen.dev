const { createXMLSitemap } = require('../utilities/sitemap');

const HOSTNAME = process.env.HOSTNAME || 'https://localhost:3000';

export const getServerSideProps = async ({ res }) => {
  const links = [{ url: '/signup' }];
  const sitemap = await createXMLSitemap(links, HOSTNAME);

  res.setHeader('Content-Type', 'application/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default () => null;
