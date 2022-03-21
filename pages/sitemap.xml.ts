import { createXMLSitemapForSubdomain } from '../utilities/sitemap';
import { getSubdomain } from '../utilities/domain';
import { GetServerSideProps } from 'next/types';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const { host } = req.headers;
  if (!host) {
    res.statusCode = 404;
    res.end();
    return { props: {} };
  }

  const subdomain = getSubdomain(host);
  if (!subdomain) {
    res.statusCode = 404;
    res.end();
    return { props: {} };
  }

  try {
    const sitemap = await createXMLSitemapForSubdomain(host, subdomain);

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
