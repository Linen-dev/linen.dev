import {
  createXMLSitemapForSubdomain,
  createXMLSitemap,
} from '../utilities/sitemap';
import { getSubdomain } from '../utilities/domain';

export const getServerSideProps = async ({ req, res }) => {
  const { host } = req.headers;
  const subdomain = getSubdomain(host);

  try {
    const sitemap = subdomain
      ? await createXMLSitemapForSubdomain(subdomain)
      : await createXMLSitemap();

    res.setHeader('Content-Type', 'application/xml');
    res.write(sitemap);
    res.end();
  } catch (exception) {
    res.statusCode = 404;
    res.end();
  }

  return {
    props: {},
  };
};

export default () => null;
