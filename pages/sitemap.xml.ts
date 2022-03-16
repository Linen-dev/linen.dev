import {
  createXMLSitemapForSubdomain,
  createXMLSitemap,
} from '../utilities/sitemap';
import { getDomain, getSubdomain } from '../utilities/domain';

export const getServerSideProps = async ({ req, res }) => {
  const { host } = req.headers;
  const domain = getDomain(host);
  const subdomain = getSubdomain(host);

  try {
    const sitemap = subdomain
      ? await createXMLSitemapForSubdomain(domain, subdomain)
      : await createXMLSitemap(domain);

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
