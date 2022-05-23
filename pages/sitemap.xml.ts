import { createXMLSitemapForSubdomain } from '../utilities/sitemap';
import { getSubdomain, isLinenDomain } from '../utilities/domain';
import { GetServerSideProps } from 'next/types';
import { downloadSitemapMain } from 'services/sitemap';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const { host } = req.headers;

  try {
    // new feature :: sitemap from s3
    const domain = isLinenDomain(host) ? 'linen.dev' : (host as string);
    const sitemap = await downloadSitemapMain(domain);
    res.write(sitemap);
    res.end();
    return { props: {} };
  } catch (exception) {
    console.error(exception);

    try {
      // fallback :: old function
      if (!host) {
        throw 'host it missing';
      }
      const subdomain = getSubdomain(host);
      if (!subdomain) {
        throw 'is not a subdomain';
      }
      const sitemap = await createXMLSitemapForSubdomain(host, subdomain);
      res.setHeader('Content-Type', 'application/xml');
      res.write(sitemap);
      res.end();
    } catch (error) {
      res.statusCode = 404;
      res.end('Not found');
    }
  }

  return {
    props: {},
  };
};

// eslint-disable-next-line import/no-anonymous-default-export
export default () => null;
